# Deployment

The Gate is designed to live on a private LAN host with the Android TV
connecting to it over HTTP. The **recommended** deployment is Docker (or
Synology Container Manager) — that's what gives you crash recovery, log
rotation, and clean upgrades for free.

## Option A — Synology Container Manager (recommended)

Repo layout when you clone or extract on the NAS:

```
The Gate/
├── source/                     # git checkout of this repo
│   ├── docker-compose.yml
│   └── app/Dockerfile
├── data/
│   ├── config.json             # persisted runtime config
│   └── vocabulary.json         # persisted vocabulary cards
└── TheGate.apk                 # (optional) the Android TV installer
```

1. Drop the repo into a Synology share, e.g. via File Station:
   `\\<nas>\<share>\The Gate\source\`.
2. Put your existing `config.json` and `vocabulary.json` into
   `The Gate/data/`. If you're starting fresh, copy the seed files from
   `source/app/` or let the container create defaults on first boot.
3. DSM → **Container Manager → Project → Create**:
   - **Project name**: `thegate`
   - **Path**: `/volume1/.../The Gate/source`
   - **Source**: *Use existing docker-compose.yml*
4. Click **Build**, then **Run**. The `unless-stopped` restart policy in
   the compose file takes over from there.

To update the app:

```bash
git pull
docker compose up -d --build
```

Container Manager has an equivalent **Update → Build & Run** action in
the project UI.

## Option B — Plain `docker compose`

Same layout, same commands, no Synology UI:

```bash
cd "/path/to/The Gate/source"
docker compose up -d --build
docker compose logs -f thegate
```

The healthcheck (`/api/config`) marks the container unhealthy if the API
stops responding. Combined with `restart: unless-stopped` you get full
crash recovery.

## Option C — systemd on a Raspberry Pi (no Docker)

```ini
# /etc/systemd/system/thegate.service
[Unit]
Description=The Gate web app
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/opt/thegate
ExecStart=/usr/bin/node server.js
Restart=on-failure
User=pi
Environment=PORT=5501
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now thegate
journalctl -u thegate -f
```

## Option D — Synology Task Scheduler (legacy, not recommended)

This was the original deployment. It works but:

- doesn't restart on crash,
- doesn't rotate logs,
- can be wiped by DSM upgrades.

Prefer Option A. Keeping the recipe here for historical reference:

```bash
# Triggered Task → Boot-up → User-defined script
cd /volume1/share/TheGate && /usr/local/bin/node server.js >> /var/log/thegate.log 2>&1
```

## Android TV APK

Set the target host in `android/gradle.properties`:

```properties
GATE_URL=http://<your-host>:5501/
```

Build:

```powershell
cd android
./build-apk.ps1
```

Install one of three ways:

| Method                 | When to use                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `install-to-tv.ps1`    | TV has network debugging enabled.                            |
| Download via TV browser| TV cannot expose ADB. Drop the APK at `The Gate/TheGate.apk` so the container serves it at `http://<host>:5501/TheGate.apk`. |
| USB stick              | Airgap install.                                              |

After install, the launcher tile is labelled **YT** and lives next to
the system YouTube tile.

## Upgrades

| Layer      | Steps                                                                |
| ---------- | -------------------------------------------------------------------- |
| Container  | `git pull && docker compose up -d --build`                           |
| Vocabulary | Edit live via dashboard. No restart needed.                          |
| Config     | Edit live via dashboard.                                             |
| APK        | Bump `versionCode` in `android/app/build.gradle`, rebuild, drop into `The Gate/TheGate.apk`. |

## Backup & rollback

`The Gate/data/` is the only stateful thing. Back up:

```
The Gate/data/config.json
The Gate/data/vocabulary.json
```

Rolling back is `cp backup/config.json data/config.json` and
`docker compose restart thegate`.
