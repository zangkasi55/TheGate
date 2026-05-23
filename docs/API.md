# API

The web app exposes a small JSON REST API under `/api/`. All payloads are
JSON. There is no authentication — the API is intended for trusted-LAN
deployment behind your router. See [SECURITY.md](SECURITY.md) for
discussion of WAN exposure.

Base URL: `http://<your-host>:5501`

## `GET /api/config`

Returns the current configuration.

**Response 200**

```json
{
  "TOTAL_ROUNDS": 3,
  "MAX_RETRIES": 2,
  "YOUTUBE_PLAY_LIMIT_MS": 600000,
  "YOUTUBE_URL": "https://www.youtube.com/tv"
}
```

| Field                 | Type   | Meaning                                              |
| --------------------- | ------ | ---------------------------------------------------- |
| `TOTAL_ROUNDS`        | int    | Vocabulary cards required to unlock playback.        |
| `MAX_RETRIES`         | int    | Attempts allowed per card.                           |
| `YOUTUBE_PLAY_LIMIT_MS` | int  | Milliseconds of playback before the gate re-engages. |
| `YOUTUBE_URL`         | string | URL handed to the player.                            |

## `POST /api/config`

Partially updates the configuration. Fields omitted from the body are left
unchanged.

**Request body** (any subset of):

```json
{
  "TOTAL_ROUNDS": 5,
  "MAX_RETRIES": 3,
  "YOUTUBE_PLAY_LIMIT_MS": 900000,
  "YOUTUBE_URL": "https://www.youtube.com/tv"
}
```

**Response 200**

```json
{
  "message": "Configuration updated successfully!",
  "config": { /* full updated config */ }
}
```

## `GET /api/vocabulary`

Returns the full vocabulary list.

**Response 200**

```json
[
  { "word": "cat", "emoji": "🐱", "category": "animal" },
  { "word": "two", "emoji": "2️⃣", "category": "number", "alts": ["to", "too"] }
]
```

| Field      | Type     | Meaning                                                 |
| ---------- | -------- | ------------------------------------------------------- |
| `word`     | string   | The target English word (lower-case).                   |
| `emoji`    | string   | Display "picture".                                      |
| `category` | string   | Free-form tag (animal / fruit / number / shape / ...).  |
| `alts`     | string[] | Optional accepted mispronunciations.                    |

## `POST /api/vocabulary`

Adds a card. Duplicate `word` (case-insensitive) returns 400.

**Request body**

```json
{
  "word": "koala",
  "emoji": "🐨",
  "category": "animal",
  "alts": ["coala"]
}
```

**Response 201**

```json
{
  "message": "Added to vocabulary library!",
  "item": { /* normalised card */ },
  "total": 116
}
```

**Errors**

| Status | Body                                            | Cause                                  |
| ------ | ----------------------------------------------- | -------------------------------------- |
| 400    | `{ "error": "Word, emoji, and category are required" }` | Missing field. |
| 400    | `{ "error": "Word already exists in database" }` | Duplicate.                            |

## `DELETE /api/vocabulary/:word`

Removes a card by `word` (case-insensitive).

**Response 200**

```json
{ "message": "Successfully deleted \"cat\"!", "total": 114 }
```

**Response 404**

```json
{ "error": "Word not found" }
```

## Error model

Errors always have shape:

```json
{ "error": "<human readable message>" }
```

5xx errors come back as `500` with `{ "error": "Failed to ..." }`.
