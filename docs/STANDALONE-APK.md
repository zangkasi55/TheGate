# Standalone APK Guide (No Server Setup)

This document defines the complete standalone package for The Gate Android TV app.

## Release artifact

Canonical install file:

- `TheGate_SAL.apk`

Location after build:

- `android/app/build/outputs/apk/debug/TheGate_SAL.apk`

Distribution copy:

- `app/TheGate_SAL.apk`

## Goal

Deliver a single APK that users can download and install directly on Android TV with no NAS, no Node.js process, and no local network backend setup.

## What is inside the standalone APK

1. Frontend UI (`index.html`, `app.js`, `styles.css`) is bundled into APK assets.
2. Vocabulary dataset (`vocabulary.js`) is bundled into APK assets.
3. Runtime configuration is stored on-device using local storage.
4. Parent passcode and lock settings are stored on-device.
5. YouTube unlock feature remains enabled.

Default app URL at runtime:

```properties
GATE_URL=file:///android_asset/index.html
```

## Parent settings at login

On splash screen, open `Parent Settings` and unlock with passcode.

Default passcode:

- `1234`

Configurable values:

1. `Time Limit (minutes)`
2. `Questions To Answer`
3. `Correct Needed To Unlock`
4. `New Passcode` (optional)

Validation:

- Time limit: `1-120`
- Questions: `1-20`
- Correct needed: `1..Questions`

## YouTube behavior in standalone mode

1. Child completes the vocabulary round.
2. YouTube unlocks only when `score >= Correct Needed To Unlock`.
3. Session auto-returns to gate when time limit ends.
4. Child must pass the gate again to continue.

Internet is still required for YouTube playback, but no server is required for The Gate app itself.

## Build steps

From `android/`:

```powershell
.\build-apk.ps1 -Configuration Debug
```

Create release filename:

```powershell
Copy-Item -Force .\app\build\outputs\apk\debug\app-debug.apk .\app\build\outputs\apk\debug\TheGate_SAL.apk
Copy-Item -Force .\app\build\outputs\apk\debug\TheGate_SAL.apk ..\app\TheGate_SAL.apk
```

## TV installation options

### Option A: ADB install (recommended for admins)

```powershell
$adb = Join-Path $env:LOCALAPPDATA 'TheGateAndroidTools\android-sdk\platform-tools\adb.exe'
& $adb connect <tv-ip>:5555
& $adb install -r .\app\build\outputs\apk\debug\TheGate_SAL.apk
```

### Option B: User download link (recommended for parents/users)

1. Upload `TheGate_SAL.apk` to your file share/web share.
2. Open the link in TV browser.
3. Download and install APK.
4. Grant install-from-unknown-sources when prompted.

## Replacement policy for new standalone versions

When shipping a new standalone build:

1. Rebuild APK.
2. Replace the previous distributed APK with latest `TheGate_SAL.apk`.
3. Keep old builds in archive if rollback is needed.

## Optional hosted mode

If you ever need server mode again, set `android/gradle.properties`:

```properties
GATE_URL=http://<your-host>:5501/
```

## Security and support notes

1. Change default passcode on first run.
2. Standalone mode stores config locally on each TV.
3. If app state is corrupted, clear app data and reconfigure parent settings.
