# The Gate — Android TV WebView wrapper

An Android TV WebView that hosts the [`app/`](../app) gate web app and lets
it own the screen as if it were a native launcher.

## Configure

Standalone APK mode is now the default. The web app is packaged inside the APK
and loaded from:

```properties
GATE_URL=file:///android_asset/index.html
```

You can still point the wrapper at a hosted web app by editing
[`gradle.properties`](./gradle.properties):

```properties
GATE_URL=http://<your-host-ip>:5501/
```

`<your-host-ip>` is the LAN address of the machine running `node server.js`
from the [`app/`](../app) folder (a NAS, a Raspberry Pi, or any always-on
host).

The source contains no hard-coded host addresses; the value is injected
into `BuildConfig.GATE_URL` at compile time.

## Build

```powershell
.\build-apk.ps1
```

The unsigned debug APK is written to:

```text
app\build\outputs\apk\debug\app-debug.apk
```

Standalone distribution filename:

```text
app\build\outputs\apk\debug\TheGate_SAL.apk
```

Generate it after build:

```powershell
Copy-Item -Force .\app\build\outputs\apk\debug\app-debug.apk .\app\build\outputs\apk\debug\TheGate_SAL.apk
```

On first run, `build-apk.ps1` bootstraps a portable JDK 17, Gradle 8.10.2
and Android SDK build-tools 35.0.0 under
`%LOCALAPPDATA%\TheGateAndroidTools` so the host machine does not need
Android Studio.

## Install on an Android TV

1. Enable **Developer options** on the TV
   (Settings → About → click the build number 7 times).
2. Enable **USB debugging** and **Network debugging**.
3. From the build host:

   ```powershell
   $adb = Join-Path $env:LOCALAPPDATA 'TheGateAndroidTools\android-sdk\platform-tools\adb.exe'
   & $adb connect <tv-ip>:5555
   & $adb install -r app\build\outputs\apk\debug\app-debug.apk
   ```

4. Or use the helper:

   ```powershell
   .\install-to-tv.ps1 -TvIp <tv-ip>
   ```

   Android 11+ wireless debugging (pair first):

   ```powershell
   .\install-to-tv.ps1 -PairAddress <tv-ip>:<pair-port> -TvIp <tv-ip>
   ```

If the TV does not expose network debugging, host `TheGate_SAL.apk` on the
web server (drop the file into the `app/` folder) and download it through
the TV browser. Launcher label: `YT`. Package: `com.thegate.tv`.

## Runtime behaviour

| Phase                          | What happens                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| App start                      | Loads `GATE_URL` into the foreground WebView. Vocab gate runs.                                     |
| Gate passed                    | A second WebView is brought to the front loading `https://www.youtube.com/tv` (configurable).     |
| Time limit reached             | Native bridge pauses the `<video>` element and brings the gate WebView back on top.                |
| User passes the gate again     | Gate WebView hides; `video.play()` resumes the **same** video at the **same** position.            |
| Remote BACK while in YouTube   | Navigates YouTube WebView history (`goBack()`).                                                    |
| Remote BACK while in gate UI   | Default WebView back navigation.                                                                   |

The native bridge surfaces two objects to the web app:

- `window.TheGateSpeech.{listen, cancel}` — Android `SpeechRecognizer`, on
  device, no cloud.
- `window.TheGatePlayer.{play, cancel}` — owns the YouTube WebView.

The web app gracefully falls back to the browser Web Speech API and an
iframe player when those bridges are absent.

## Parent settings in standalone mode

On the splash/login page, `Parent Settings` is protected by passcode.

- Default passcode: `1234`
- Configurable in-app:
   - Time limit (minutes)
   - Questions to answer
   - Correct needed to unlock

Settings are stored locally on device (no backend required).

## Permissions

- `android.permission.INTERNET`
- `android.permission.RECORD_AUDIO` — speech recognition microphone.

Cleartext HTTP is permitted via the base config in
[`network_security_config.xml`](./app/src/main/res/xml/network_security_config.xml)
because the web app is intended to run on a private LAN. Remove the
exception if you host the app over HTTPS.
