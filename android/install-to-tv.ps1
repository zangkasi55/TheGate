param(
  [Parameter(Mandatory = $true)]
  [string]$TvIp,

  [string]$PairAddress
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Tools = Join-Path $env:LOCALAPPDATA 'TheGateAndroidTools'
$Adb = Join-Path $Tools 'android-sdk\platform-tools\adb.exe'
$Apk = Join-Path $Root 'app\build\outputs\apk\debug\app-debug.apk'

if (!(Test-Path $Adb)) {
  throw "ADB not found at $Adb. Run tools/bootstrap-android.ps1 first."
}

if (!(Test-Path $Apk)) {
  throw "APK not found at $Apk. Run build-apk.ps1 first."
}

if ($PairAddress) {
  & $Adb pair $PairAddress
}

& $Adb connect "$TvIp`:5555"
& $Adb install -r $Apk
& $Adb shell monkey -p com.thegate.tv -c android.intent.category.LAUNCHER 1