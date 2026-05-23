# Standalone APK Mode (No Backend Required)

This document describes version `1.1.0` standalone mode for The Gate Android TV app.

## Goal

Run The Gate as a self-contained APK without depending on a NAS or Node backend for runtime configuration.

## What changed in standalone mode

1. The web UI is bundled into APK assets at build time.
2. Default startup URL is local:

```properties
GATE_URL=file:///android_asset/index.html
```

3. Parent settings are now on the login/splash screen, protected by passcode.
4. Runtime settings are persisted locally on-device using browser local storage.

## Parent settings on login page

From splash screen, open `Parent Settings` and enter passcode.

Default passcode:

- `1234`

Configurable values:

1. `Time Limit (minutes)`
2. `Questions To Answer`
3. `Correct Needed To Unlock`
4. Optional passcode rotation (`New Passcode`)

Validation rules:

- Time limit: `1-120` minutes
- Questions to answer: `1-20`
- Correct needed: `1` to `Questions To Answer`

## Unlock behavior

After quiz ends:

- YouTube unlocks only if `score >= Correct Needed To Unlock`.
- If score is lower, the watch button stays disabled and shows required threshold.

## Build

From `android/`:

```powershell
.\build-apk.ps1
```

Output APK:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Optional hosted mode

You can still point the wrapper to a hosted gate URL by changing `android/gradle.properties`:

```properties
GATE_URL=http://<your-host>:5501/
```

## Notes

- Standalone mode removes backend dependency for configuration at runtime.
- Vocabulary and gameplay scripts are included in the app assets packaged into the APK.
- For security, change default passcode after first install.
