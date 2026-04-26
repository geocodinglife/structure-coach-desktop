# Structure Coach (Desktop)

Native Linux build of [Structure Coach](https://github.com/geocodinglife/structure-coach), a writing coach that applies the Paramedic Method (passive voice, nominalizations, prepositions, filler, spine, flow) to your text and offers an AI rewrite for comparison.

This is a personal project — the code is public so it can ship through Flathub and AUR, but issues and pull requests may not be answered. Use at your own pleasure.

## Status

Early scaffold. The Chrome extension at the link above is the working version; this repo is the in-progress port to a standalone Tauri app.

## Stack

- **Tauri 2** — Rust shell, system webview (WebKitGTK on Linux)
- **Vanilla JS + CSS** — frontend, no build step
- **compromise.js** — POS tagging for noun-stack and nominalization filters

## Develop

```sh
npm install
npm run tauri dev
```

## License

MIT — see [LICENSE](./LICENSE).
