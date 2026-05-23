# Security & Privacy

The Gate is intentionally simple. This document tells you what that means
in practice.

## Privacy posture

- **No telemetry.** The web app does not call any external service apart
  from the YouTube URL the parent configured.
- **No accounts.** No sign-in, no email, no analytics SDK.
- **No audio leaves the device** when used through the Android TV
  wrapper — `android.speech.SpeechRecognizer` resolves on-device when
  Google's offline recognizer is installed.
- **Browser fallback is honest about cloud STT.** The Web Speech API in
  Chrome/Edge sends audio to Google servers; we surface that in the
  README so parents know.

## Threat model

The Gate is designed for a **trusted LAN**. The defaults assume:

- The web app host is reachable only from inside the home network.
- Anyone on the LAN is a trusted user.
- The Android TV is owned by the same family.

What's in scope:

- Stopping a young child from launching YouTube without doing the
  vocabulary round.
- Resuming the same video after a timer so the kid doesn't lose progress.
- Letting a parent edit limits/vocabulary from a phone without SSH.

What's **out of scope**:

- Stopping a teenager who knows how to sideload apps or factory reset.
- Stopping a determined adult from bypassing the gate.
- WAN-grade authentication.

## What is NOT secure by default

| Item                         | Why                                              | Mitigation                                    |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------- |
| HTTP, no TLS                 | LAN deployment is the design target.             | Front with Caddy / Synology reverse proxy for HTTPS. |
| No auth on `/api/*`          | Trusted LAN.                                     | Put it behind a reverse proxy with basic auth.|
| Cleartext traffic allowed in `network_security_config.xml` | LAN. | Remove the base-config exception and use HTTPS. |
| Dashboard at `/dashboard.html` | Lives at the same origin as the kid UI.        | Block by IP at the reverse proxy.             |

## If you want to go WAN

1. Put the web app behind a TLS-terminating reverse proxy (Caddy,
   Synology Reverse Proxy, Cloudflare Tunnel).
2. Remove the cleartext exception from
   `android/app/src/main/res/xml/network_security_config.xml`.
3. Add basic auth — at minimum — on `/api/*` and `/dashboard.html`.
4. Rebuild the APK with `GATE_URL=https://your-host.example/` in
   `gradle.properties`.
5. Treat the YouTube unlock as a feature, not a security control. A
   motivated kid will figure out the Android settings before they figure
   out OAuth.

## Data at rest

- `app/config.json` — non-sensitive runtime configuration.
- `app/vocabulary.json` — vocabulary list. Non-sensitive.
- `SharedPreferences last_youtube_url` on the TV — last URL the child
  was watching. Stored unencrypted in app-private storage.

No PII is collected.

## Audit / logs

The Express server logs requests to stdout. Capture via `journalctl`,
`docker logs`, or Task Scheduler output redirection. No log is written
to disk by default.
