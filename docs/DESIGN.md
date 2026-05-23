# Design

This document describes the user experience and the state machine behind
it. The goal is to make every UX decision auditable — *why* this gate
works the way it does, not just *what* it does.

## Goals

1. **Make the kid talk.** Reading off a screen is too easy. We need them
   to say the word out loud so they practise pronunciation.
2. **No false hopes.** When time is up, the kid must come back to the
   gate. But forcing them to lose the video they were enjoying creates
   tantrums, so the system pauses and **resumes** the exact same video.
3. **Trivial to operate.** Parents change limits and add vocabulary from
   a phone on the LAN, no SSH and no app rebuild.
4. **No cloud.** Voice never leaves the device unless the user explicitly
   uses a browser that does cloud STT. No telemetry, no accounts.

## UX flow

```
splash ─▶ round 1 card ─▶ speak ─▶ matched? ─yes─▶ next card
                          ▲          │no
                          │          ▼
                          ╰── retry (≤ MAX_RETRIES)
                                     │
                                     ▼
                              round failed
                                     │
                                     ▼
all cards in round done ─▶ done screen ─▶ play YouTube (10 min)
                                            │
                                            ▼ (timer)
                                          pause
                                            │
                                            ▼
                                          gate overlay
                                            │
                                          ▼
                                          new round
                                            │
                                          ▼
                                          resume same video
```

### Card UI

Each card is one English word with an emoji "picture" and an optional
list of acceptable mispronunciations (`alts`).

Example: `four` accepts `for`, `floor` is a Levenshtein-2 match for older
kids whose `r`/`l` is still soft.

### Done screen

When the kid finishes a round we show a celebratory "done" screen for a
beat before handing off to YouTube. This is intentional — it tells the
kid that *the gate* let them through. It's the moment they associate the
small effort with the reward.

### Timer expiry

When `YOUTUBE_PLAY_LIMIT_MS` elapses, we do **not** load a new URL or
unload the player. We:

1. Pause `<video>` via the bridge.
2. Bring the gate WebView to the front.
3. Start a new round.

On the next success, the gate WebView is hidden again and
`video.play()` resumes from the same point.

This is the most important UX decision in the project. The naive
"reload" approach broke the kid's flow every 10 minutes and turned the
gate into a punishment. Resume-in-place turns it into a pause break with
a price the kid has already agreed to pay.

## State machine (gate web app)

```
       ┌───────────┐  press OK  ┌────────────┐  speak ok   ┌────────┐
       │  SPLASH   │ ─────────▶ │  CARD      │ ──────────▶ │  CARD  │
       └───────────┘            │  (round n) │             │ (n+1)  │
              ▲                 └────┬───────┘             └───┬────┘
              │ ESC                  │ speak fail              │
              │                      ▼                         │
              │                ┌──────────┐  retries left      │
              │                │  RETRY   │ ◀──────────────────┘
              │                └────┬─────┘
              │                     │ retries exhausted
              │                     ▼
              │                ┌──────────┐
              └────────────────│  FAILED  │
                               └──────────┘
                  all rounds done
                        │
                        ▼
                  ┌──────────┐  hand off       ┌──────────┐
                  │   DONE   │ ──────────────▶ │ PLAYING  │
                  └──────────┘                 └────┬─────┘
                                                    │ timer
                                                    ▼
                                              ┌──────────┐
                                              │  PAUSED  │ ──▶ CARD (n=1)
                                              └──────────┘
```

The wrapper's `endNativeSession()` is the transition from `PLAYING` to
`PAUSED`; `playNativeSession()` is the transition back into `PLAYING`.

## Why two WebViews instead of one

A single WebView either has the gate or YouTube — not both. Resuming the
same video after a timeout therefore meant either:

- **Reload the same URL** — YouTube starts at frame 0 of "Up Next" or
  the same video at frame 0. Kids riot.
- **Keep YouTube parked in a Bluetooth-style background** — not possible
  with a single WebView.

So the wrapper holds two WebViews in a `FrameLayout`, swaps Z-order, and
pauses the `<video>` element while the gate sits on top. The YouTube
WebView never unloads; the page state — the DOM, the playback position,
the cookies, the watch history — is preserved.

## Why on-device speech

Sending a kid's voice to a cloud service is unnecessary for an
80-card vocabulary list. The Android `SpeechRecognizer` works offline
once Google's on-device recognizer is installed. In the browser fallback
we accept the cloud-backed Web Speech API as a pragmatic compromise —
the gate is useful even on a Chromebook in airplane mode because the
"Speak" button degrades gracefully.

## Why JSON files instead of a database

The whole state is well under 100 KB. JSON files on disk are:

- trivial to back up (copy two files),
- trivial to seed (commit a `vocabulary.json` to the repo),
- impossible to corrupt in ways that matter (atomic
  `writeFileSync` per request),
- and obvious to inspect when something goes wrong.

A database would add operational complexity for zero kid-facing benefit.

## Why `gradle.properties` for `GATE_URL`

The wrapper points at whatever LAN host runs the gate web app. Hard-coding
the URL in source made every fork meaningless, and every personal LAN IP
leaked into git history. Routing it through `gradle.properties` →
`BuildConfig.GATE_URL` keeps the source clean and gives operators a single
file to edit per environment.
