# Deployment

The Gate is designed to live on a private LAN host with the Android TV
connecting to it over HTTP. This document covers a few common patterns.
Every option is equivalent — pick whichever your home infra prefers.

## Option A — Synology NAS (Task Scheduler)

Used by the reference deployment. Works on any DSM 7 NAS with the
Node.js v20 package.

1. Copy the contents of `app/` to the NAS, e.g. `\\<nas>\share\TheGate\`.
2. SSH in and install dependencies (one-time):

   ```bash
   cd /volume1/share/TheGate
   /usr/local/bin/pnpm install
   ```

3. DSM → **Control Panel → Task Scheduler → Create → Triggered Task →
   User-defined script**.
   - **Event**: Boot-up
   - **User**: root (or a service account with read access to the folder)
   - **Run command**:

     ```bash
     cd /volume1/share/TheGate && /usr/local/bin/node server.js >> /var/log/thegate.log 2>&1
     ```

4. Run the task once manually to start the server; subsequent reboots
   start it automatically.
5. Verify from the LAN:

   ```powershell
   Invoke-WebRequest "http://<nas-ip>:5501/api/config"
   ```

To update vocabulary / config, use the parent dashboard at
`http://<nas-ip>:5501/dashboard.html` — DSM does not need to be touched.

## Option B — Raspberry Pi (systemd)

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

## Option C — Docker

```dockerfile
# Dockerfile (place at repo root)
FROM node:20-alpine
WORKDIR /app
COPY app/package.json ./
RUN npm install --omit=dev
COPY app/ ./
EXPOSE 5501
CMD ["node", "server.js"]
```

```bash
docker build -t thegate .
docker run -d --name thegate -p 5501:5501 \
  -v "$(pwd)/data:/app" \
  --restart unless-stopped thegate
```

The volume mount keeps `config.json` and `vocabulary.json` out of the
image so upgrades don't lose state.

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
| Download via TV browser| TV cannot expose ADB. Host the APK at e.g. `app/TheGate.apk`.|
| USB stick              | Airgap install.                                              |

After install, the launcher tile is labelled **YT** and lives next to
the system YouTube tile.

## Upgrades

| Layer      | Steps                                                                |
| ---------- | -------------------------------------------------------------------- |
| Web app    | `git pull` → restart the Node service.                               |
| Vocabulary | Edit live via dashboard. No restart needed.                          |
| Config     | Edit live via dashboard.                                             |
| APK        | Bump `versionCode` in `android/app/build.gradle`, rebuild, install.  |

## Rollback

Every state-changing dashboard call rewrites the JSON file atomically;
keep a periodic backup of:

- `app/config.json`
- `app/vocabulary.json`

Rolling back is `cp backup/config.json app/config.json` and a service
restart.
