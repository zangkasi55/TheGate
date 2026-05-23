# Architecture

The Gate is a two-tier system that runs entirely on a private LAN.

```
+----------------------------+      +-----------------------------+
|        Android TV          |      |     LAN host (NAS / Pi)     |
| +------------------------+ |      |                             |
| | TheGate APK            | |      | +-------------------------+ |
| |  com.thegate.tv  YT    | |HTTP  | | server.js (Express)     | |
| |  ┌──────────┐          | |◀────▶| |  /api/config            | |
| |  │ WebView A│ gate UI  | |      | |  /api/vocabulary        | |
| |  └──────────┘          | |      | |  static files           | |
| |  ┌──────────┐          | |      | +-------------------------+ |
| |  │ WebView B│ youtube  | |      |                             |
| |  └──────────┘          | |      | config.json   vocab.json    |
| |  Speech bridge ◀── mic | |      +-----------------------------+
| |  Player  bridge ── 10m |
| +------------------------+ |
+----------------------------+
```

## Components

### `app/` — Node/Express web app

- **Static UI** (`index.html`, `styles.css`, `app.js`) — vocabulary game.
- **Dashboard** (`dashboard.html`) — parent controls.
- **REST API** (`server.js`) — exposes `/api/config` and `/api/vocabulary`.
- **Persistent state** — JSON files (`config.json`, `vocabulary.json`)
  on the local disk. No database.

The web app is self-contained: it has no external service dependencies, no
analytics, and works fully offline once loaded. Even speech recognition is
done either in the browser (Web Speech API → Google) or, when running
inside the Android wrapper, on-device by Android's `SpeechRecognizer`.

### `android/` — Android TV WebView wrapper

A single `Activity` (`MainActivity.java`) owns a `FrameLayout` with two
`WebView` children:

| WebView      | Role                                                     |
| ------------ | -------------------------------------------------------- |
| `webView`    | Loads `BuildConfig.GATE_URL` — the gate UI.              |
| `youtubeWebView` | Loads `YOUTUBE_URL` after the gate is passed.       |

Two JavaScript bridges sit on the gate WebView:

```text
window.TheGateSpeech.listen()    -> Android SpeechRecognizer.startListening()
window.TheGateSpeech.cancel()    -> Android SpeechRecognizer.cancel()
window.TheGatePlayer.play(url, durationMs)
                                 -> showYouTubeWebView(); startTimer()
window.TheGatePlayer.cancel()    -> endNativeSession(immediate=true)
```

When the Android Activity calls into the WebView it does so via
`evaluateJavascript` — there are no DOM hooks beyond `window.__theGate*`
callbacks the web app registers.

### View hierarchy and Z-order

Both WebViews are always mounted. Z-order is what decides which one the
remote sees:

| State            | Front WebView      | Back WebView       | YouTube playback   |
| ---------------- | ------------------ | ------------------ | ------------------ |
| Gate active      | `webView`          | `youtubeWebView` (hidden) | -           |
| Playing          | `youtubeWebView`   | `webView` (gone)   | playing            |
| Time up / overlay| `webView`          | `youtubeWebView` (visible) | paused      |

The "time up" state pauses `<video>` via `evaluateJavascript` but does
**not** unload the YouTube page, which is what lets resume be frame-exact.

## Sequence: a complete session

```
TV remote        Gate UI (WebView A)    Wrapper            YouTube (WebView B)
   │                  │                    │                    │
   │  press OK        │                    │                    │
   ├─────────────────▶│ Start game         │                    │
   │                  │ "say cat"          │                    │
   │  speak           │ TheGateSpeech.     │                    │
   ├─────────────────▶│ listen()           │                    │
   │                  │                    │ SpeechRecognizer   │
   │                  │                    │ → "cat"            │
   │                  │ ◀──onResult────────│                    │
   │                  │ next card...       │                    │
   │                  │ TheGatePlayer.     │                    │
   │                  │ play(url, 600000)  │                    │
   │                  │ ─────────────────▶ │ showYouTubeWebView()│
   │                  │                    │ loadUrl(YT_URL)─▶  │
   │                  │ (hidden)           │                    │ playing
   │  10:00 elapsed   │                    │ timer fires        │
   │                  │ (brought to front) │ pauseYouTubePlayback│
   │                  │                    │                    │ paused
   │                  │ TheGatePlayer.     │                    │
   │                  │ play(url, 600000)  │                    │
   │                  │                    │ resumeYouTubePlayback│
   │                  │ (hidden)           │                    │ resume
```

## Speech path

| Environment           | Engine                                  | Network?           |
| --------------------- | --------------------------------------- | ------------------ |
| Chrome / Edge browser | Web Speech API (`webkitSpeechRecognition`) | Google cloud (browser does this) |
| Android TV wrapper    | `android.speech.SpeechRecognizer`       | On-device when Google's on-device recognizer is installed; otherwise Google cloud via system service. |

The web app never sees audio bytes — only the resulting transcript.

## Player path

When the wrapper is present the gate web app calls
`window.TheGatePlayer.play(url, durationMs)`. The wrapper then:

1. Brings `youtubeWebView` to the front.
2. Loads `url` only on first play of a session; later plays just call
   `video.play()` so the same video resumes at the same position.
3. Schedules `endNativeSession()` after `durationMs`.

If the wrapper is absent, the web app falls back to:

1. An `<iframe src="...">` mounted in the gate page, or
2. `window.location.href = YOUTUBE_URL` for full-tab fallback.

## Configuration source-of-truth

| Item              | Stored in                          | Edited via                  |
| ----------------- | ---------------------------------- | --------------------------- |
| `TOTAL_ROUNDS`    | `app/config.json`                  | Dashboard `POST /api/config`|
| `MAX_RETRIES`     | `app/config.json`                  | Dashboard                   |
| `YOUTUBE_PLAY_LIMIT_MS` | `app/config.json`            | Dashboard                   |
| `YOUTUBE_URL`     | `app/config.json`                  | Dashboard                   |
| Vocabulary cards  | `app/vocabulary.json`              | Dashboard `POST/DELETE /api/vocabulary` |
| Wrapper gate URL  | `android/gradle.properties` → `BuildConfig.GATE_URL` | Rebuild APK |
| Wrapper package   | `android/app/build.gradle`         | Rebuild APK                 |
