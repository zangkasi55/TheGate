# The Gate — Web app

A child-friendly "speak the word" gate that must be passed before
`https://www.youtube.com/tv` will play. Designed to be hosted on a private
LAN and consumed either from a browser (kiosk mode) or from the
[Android TV WebView wrapper](../android).

## Files

| File              | Purpose                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `index.html`      | Splash / card / done screens.                                          |
| `styles.css`      | TV-friendly styling. Uses viewport units.                              |
| `app.js`          | Game state machine, speech recognition, lenient matcher.               |
| `vocabulary.js`   | ~115 kindergarten words with emoji art + alt pronunciations.           |
| `vocabulary.json` | Runtime vocabulary store edited via the dashboard.                     |
| `dashboard.html`  | Parent dashboard (`/dashboard.html`) — limits, vocabulary CRUD.        |
| `server.js`       | Express server exposing `/api/config`, `/api/vocabulary`, static files.|
| `config.json`     | Persistent gate configuration written by the dashboard.                |
| `seed-db.js`      | Seeds `vocabulary.json` from `vocabulary.js`.                          |

## Run

```powershell
cd app
pnpm install
node server.js
```

Defaults: binds `0.0.0.0:5501`. Override with `PORT` / `HOST` env vars.

| Endpoint                     | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `GET /`                      | Gate UI (the kid screen).              |
| `GET /dashboard.html`        | Parent dashboard.                      |
| `GET /api/config`            | Returns current limits.                |
| `POST /api/config`           | Updates limits.                        |
| `GET /api/vocabulary`        | Lists vocabulary cards.                |
| `POST /api/vocabulary`       | Adds a card.                           |
| `DELETE /api/vocabulary/:w`  | Deletes a card.                        |

## Game configuration

`config.json` (also editable through the dashboard):

```json
{
  "TOTAL_ROUNDS": 3,
  "MAX_RETRIES": 2,
  "YOUTUBE_PLAY_LIMIT_MS": 600000,
  "YOUTUBE_URL": "https://www.youtube.com/tv"
}
```

| Key                     | Meaning                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `TOTAL_ROUNDS`          | Number of vocabulary cards the child must clear per unlock.        |
| `MAX_RETRIES`           | Attempts per card before the round is failed.                      |
| `YOUTUBE_PLAY_LIMIT_MS` | Milliseconds of unlocked playback before the gate re-engages.      |
| `YOUTUBE_URL`           | URL handed to the player WebView / iframe / browser tab.           |

## Controls

| Key             | Action                          |
| --------------- | ------------------------------- |
| Enter / Space   | Start / Speak / Advance         |
| Arrow keys      | Move focus between buttons      |
| Esc             | Back to splash                  |

D-pads on Android TV remotes emit the same events, so identical wiring
works on a real TV.

## Speech matching

The matcher (`matches()` in `app.js`) tries strategies in order:

1. Exact match of the target word in the transcript.
2. Match against `alts` in `vocabulary.js` (e.g. `two → ['to', 'too']`).
3. Levenshtein distance ≤ 1 (short words) or ≤ 2 (≥ 5 chars).
4. Full normalised transcript equals the target.

If neither the browser Web Speech API nor the Android bridge is available,
the Speak button accepts the answer so the UX never deadlocks.

## Home Assistant integration (optional)

When wrapped as the Android TV app, the package `com.thegate.tv` can be
launched from Home Assistant via `androidtv_remote`:

```yaml
service: remote.turn_on
target:
  entity_id: remote.your_android_tv
data:
  activity: com.thegate.tv
```

Replace `remote.your_android_tv` with the entity that maps to your TV.
