# The Gate

> A vocabulary-gated YouTube launcher for Android TV.

Kids who want to watch YouTube on the family TV first have to **say** a few
English vocabulary words out loud. After they get through the gate they
unlock a configurable window (default: 10 minutes) of YouTube playback on
the TV. When the timer runs out, the video pauses on the spot, the
vocabulary gate re-appears on top, and after the next successful round the
same video resumes from the same frame.

Built as two cooperating pieces:

| Layer       | Purpose                                                            | Stack                              |
| ----------- | ------------------------------------------------------------------ | ---------------------------------- |
| `app/`      | The web UI (gate + parent dashboard) and REST API for config.      | Node 20 + Express, vanilla JS/CSS. |
| `android/`  | A thin Android TV WebView wrapper that owns playback and the BACK button. | Java + AndroidX, min SDK 23, target SDK 35. |

The wrapper is optional — the web app runs in any modern Chromium browser
on its own (Web Speech API + iframe player). The Android wrapper exists so
the experience can take over a Smart TV the way YouTube itself does.

![Architecture](docs/diagrams/overview.svg)

<img width="920" height="571" alt="image" src="https://github.com/user-attachments/assets/ba10d851-295f-4c68-91cc-85e3f4623a05" />

<img width="1416" height="790" alt="image" src="https://github.com/user-attachments/assets/1ad9e389-3ef0-40b9-ae73-cbd32a5d7739" />

## Quick start

```powershell
# 1. Serve the gate web app from any always-on host (NAS, Pi, workstation)
cd app
pnpm install
node server.js               # listens on 0.0.0.0:5501

# 2. Visit http://<your-host>:5501/ from a browser to sanity-check.
#    Visit http://<your-host>:5501/dashboard.html to manage the vocabulary.

# 3. (Optional) Build the Android TV APK pointing at that host
cd ../android
notepad gradle.properties    # set GATE_URL=http://<your-host>:5501/
./build-apk.ps1              # bootstraps the toolchain on first run
./install-to-tv.ps1 -TvIp <tv-ip>
```

The TV launcher tile is labelled **YT** (`com.thegate.tv`). On launch it
loads the gate; on success it plays `YOUTUBE_URL`; on timeout it pauses
the video and overlays the gate again.

## Sample Layouts

- `app/` is the current V1 working app layout used by the project.
- `sample-v1/` is a GitHub-friendly split sample with separate `frontend/` and `backend/` folders.
- `app-v2/` contains the newer V2 sample saved separately for testing.

## Documentation

| Doc                                                | What it covers                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)       | Component diagram, native bridges, view hierarchy.                          |
| [docs/DESIGN.md](docs/DESIGN.md)                   | UX flow, state machine, why the resume model looks the way it does.        |
| [docs/API.md](docs/API.md)                         | REST contract for `/api/config` and `/api/vocabulary`.                     |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)           | LAN / NAS deployment recipes (Synology Task Scheduler, systemd, Docker).   |
| [docs/SECURITY.md](docs/SECURITY.md)               | Threat model, privacy stance (no cloud STT, no telemetry).                 |
| [docs/STANDALONE-APK.md](docs/STANDALONE-APK.md)   | Standalone APK mode with on-login parent passcode settings and local config. |
| [app/README.md](app/README.md)                     | Web app dev guide.                                                          |
| [android/README.md](android/README.md)             | Android TV build & install guide.                                          |

## Status

| Component            | State           | Notes                                                   |
| -------------------- | --------------- | ------------------------------------------------------- |
| Gate web app         | Working         | Web Speech API + ~115 vocabulary cards.                 |
| Parent dashboard     | Working         | Live config + vocabulary CRUD via REST.                 |
| Android TV wrapper   | Working         | Pause-and-overlay resume model. Version 1.1.0 (standalone-ready). |
| Native speech bridge | Working         | Uses Android `SpeechRecognizer` (Google on-device).     |
| HTTPS / WAN          | Not configured  | Designed for trusted LAN. See `docs/SECURITY.md`.       |

## License

MIT. See [LICENSE](LICENSE).
