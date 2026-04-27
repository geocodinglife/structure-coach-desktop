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
        return Err(format!("Anthropic {}: {}", status, truncate(&text, 400)));
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
        return Err(format!("Gemini {}: {}", status, truncate(&text, 400)));
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
        return Err(format!("API {}: {}", status, truncate(&text, 400)));
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_api_key, set_api_key, llm_call])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
