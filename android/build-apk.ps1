param(
  [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Tools = Join-Path $env:LOCALAPPDATA 'TheGateAndroidTools'
$Jdk = Join-Path $Tools 'jdk-17'
$Gradle = Join-Path $Tools 'gradle-8.10.2'
$Sdk = Join-Path $Tools 'android-sdk'

if (!(Test-Path $Jdk)) {
  throw "JDK not found at $Jdk. Run tools/bootstrap-android.ps1 first."
}

if (!(Test-Path $Gradle)) {
  throw "Gradle not found at $Gradle. Run tools/bootstrap-android.ps1 first."
}

if (!(Test-Path $Sdk)) {
  throw "Android SDK not found at $Sdk. Run tools/bootstrap-android.ps1 first."
}

$env:JAVA_HOME = $Jdk
$env:ANDROID_HOME = $Sdk
$env:ANDROID_SDK_ROOT = $Sdk
$env:PATH = "$Jdk\bin;$Gradle\bin;$Sdk\platform-tools;$env:PATH"

Push-Location $Root
try {
  if ($Configuration -ieq 'Release') {
    gradle assembleRelease --no-daemon
  } else {
    gradle assembleDebug --no-daemon
  }
} finally {
  Pop-Location
}