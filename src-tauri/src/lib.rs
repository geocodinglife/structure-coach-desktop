use keyring::Entry;
use serde::Deserialize;

const KEYRING_SERVICE: &str = "io.github.geocodinglife.StructureCoach";
const KEYRING_ACCOUNT: &str = "api-key";

fn entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_api_key() -> Result<String, String> {
    match entry()?.get_password() {
        Ok(s) => Ok(s),
        Err(keyring::Error::NoEntry) => Ok(String::new()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn set_api_key(key: String) -> Result<(), String> {
    let e = entry()?;
    if key.is_empty() {
        let _ = e.delete_credential();
        Ok(())
    } else {
        e.set_password(&key).map_err(|err| err.to_string())
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LlmRequest {
    provider: String,
    prompt: String,
    #[serde(default)]
    base_url: Option<String>,
    #[serde(default)]
    model: Option<String>,
}

#[tauri::command]
async fn llm_call(req: LlmRequest) -> Result<String, String> {
    let api_key = get_api_key().unwrap_or_default();

    match req.provider.as_str() {
        "anthropic" => {
            if api_key.is_empty() {
                return Err("API key missing. Open Settings to add one.".into());
            }
            call_anthropic(
                &api_key,
                req.model.as_deref().unwrap_or("claude-3-5-haiku-latest"),
                &req.prompt,
            )
            .await
        }
        "gemini" => {
            if api_key.is_empty() {
                return Err("API key missing. Open Settings to add one.".into());
            }
            call_gemini(
                &api_key,
                req.model.as_deref().unwrap_or("gemini-2.5-flash"),
                &req.prompt,
            )
            .await
        }
        "openai-compat" => {
            let base = req
                .base_url
                .filter(|s| !s.is_empty())
                .ok_or("Base URL required for OpenAI-compatible provider.")?;
            call_openai_compat(
                &base,
                &api_key,
                req.model.as_deref().unwrap_or("gpt-4o-mini"),
                &req.prompt,
            )
            .await
        }
        "ollama" => {
            let base = req
                .base_url
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| "http://localhost:11434/v1".to_string());
            call_openai_compat(
                &base,
                &api_key,
                req.model.as_deref().unwrap_or("llama3.2"),
                &req.prompt,
            )
            .await
        }
        "groq" => {
            if api_key.is_empty() {
                return Err("API key missing. Open Settings to add one.".into());
            }
            call_openai_compat(
                "https://api.groq.com/openai/v1",
                &api_key,
                req.model.as_deref().unwrap_or("llama-3.3-70b-versatile"),
                &req.prompt,
            )
            .await
        }
        other => Err(format!("Unknown provider: {}", other)),
    }
}

async fn call_anthropic(key: &str, model: &str, prompt: &str) -> Result<String, String> {
    let body = serde_json::json!({
        "model": model,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}],
    });
    let res = reqwest::Client::new()
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let status = res.status();
    let text = res.text().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(friendly_error("Anthropic", status, &text));
    }
    let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    Ok(v.pointer("/content/0/text")
        .and_then(|x| x.as_str())
        .unwrap_or("")
        .trim()
        .to_string())
}

async fn call_gemini(key: &str, model: &str, prompt: &str) -> Result<String, String> {
    let url = format!(
        "https://generativelanguage.googleapis.com/v1/models/{}:generateContent?key={}",
        model, key
    );
    let body = serde_json::json!({
        "contents": [{"parts": [{"text": prompt}]}]
    });
    let res = reqwest::Client::new()
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let status = res.status();
    let text = res.text().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(friendly_error("Gemini", status, &text));
    }
    let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    Ok(v.pointer("/candidates/0/content/parts/0/text")
        .and_then(|x| x.as_str())
        .unwrap_or("")
        .trim()
        .to_string())
}

async fn call_openai_compat(
    base: &str,
    key: &str,
    model: &str,
    prompt: &str,
) -> Result<String, String> {
    let url = format!("{}/chat/completions", base.trim_end_matches('/'));
    let body = serde_json::json!({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    });
    let mut req = reqwest::Client::new().post(&url).json(&body);
    if !key.is_empty() {
        req = req.header("Authorization", format!("Bearer {}", key));
    }
    let res = req.send().await.map_err(|e| e.to_string())?;
    let status = res.status();
    let text = res.text().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(friendly_error("Provider", status, &text));
    }
    let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    Ok(v.pointer("/choices/0/message/content")
        .and_then(|x| x.as_str())
        .unwrap_or("")
        .trim()
        .to_string())
}

fn truncate(s: &str, n: usize) -> String {
    if s.len() <= n {
        s.to_string()
    } else {
        format!("{}…", &s[..n])
    }
}

fn friendly_error(provider: &str, status: reqwest::StatusCode, body: &str) -> String {
    let detail = serde_json::from_str::<serde_json::Value>(body)
        .ok()
        .and_then(|v| {
            v.get("error")
                .and_then(|e| e.get("message"))
                .and_then(|m| m.as_str())
                .map(|s| s.to_string())
        })
        .unwrap_or_default();

    let code = status.as_u16();
    let headline = match code {
        401 | 403 => format!(
            "{} rejected your API key. Check Settings — the key may be wrong, revoked, or missing permissions.",
            provider
        ),
        404 => format!(
            "{} could not find the requested model. Check the Model field in Settings.",
            provider
        ),
        429 => format!(
            "{} rate limit reached. You've hit the quota for your plan (often the free tier). Wait a minute and try again, or upgrade your plan.",
            provider
        ),
        500 => format!(
            "{} had an internal error. Try again in a moment.",
            provider
        ),
        503 => format!(
            "{} is overloaded right now. Spikes are usually temporary — try again in a moment.",
            provider
        ),
        502 | 504 => format!(
            "{} is unreachable right now ({}). Try again in a moment.",
            provider, code
        ),
        _ => format!("{} returned HTTP {}.", provider, code),
    };

    if detail.is_empty() {
        headline
    } else {
        let short = truncate(&detail, 240);
        format!("{}\n\nProvider said: {}", headline, short)
    }
}

fn toggle_window_auto(handle: &tauri::AppHandle) {
    if let Some(window) = handle.get_webview_window("main") {
        let is_visible = window.is_visible().unwrap_or(false);
        if is_visible {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.unminimize();
            let _ = window.set_focus();
        }
    }
}

fn toggle_window_force(handle: &tauri::AppHandle, show: bool) {
    if let Some(window) = handle.get_webview_window("main") {
        if show {
            let _ = window.show();
            let _ = window.unminimize();
            let _ = window.set_focus();
        } else {
            let _ = window.hide();
        }
    }
}

use tauri::Manager;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            toggle_window_auto(app);
        }))
        .invoke_handler(tauri::generate_handler![get_api_key, set_api_key, llm_call])
        .setup(|app| {
            // 1. Create Tray Menu
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

            // 2. Build Tray Icon
            let mut tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| {
                    match event.id.as_ref() {
                        "show" => { toggle_window_force(app, true); }
                        "hide" => { toggle_window_force(app, false); }
                        "quit" => { app.exit(0); }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_window_auto(tray.app_handle());
                    }
                });

            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }

            let _ = tray_builder.build(app);

            // 3. Handle Window Close (Hide instead of Exit)
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(debug_assertions)]
                window.open_devtools();
                let w = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = w.hide();
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
