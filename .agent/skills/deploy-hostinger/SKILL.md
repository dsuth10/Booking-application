---
name: deploy-hostinger
description: Automated deployment of web app bundles to mrsutherland.net via SSH/SFTP MCP. Use when: deploying built JS bundles to Hostinger, uploading files to wp-content/uploads via SFTP, or automating the full deploy flow (build → upload → clear cache).
---

# deploy-hostinger

Automated deployment to **mrsutherland.net** (Hostinger) using the **mcp-server-ssh** MCP server.

## Prerequisites

1. **SSH Access enabled** on Hostinger: hPanel → Hosting → Advanced → SSH Access → Enable
2. **Credentials** (one of):
   - **SSH key** (recommended): Add public key to Hostinger; private key at `~/.ssh/id_ed25519` (or set `SSH_MCP_DEFAULT_KEY` in mcp.json)
   - **Password**: Same as FTP password; provide when agent calls `ssh_connect`
3. **FTP IP** from hPanel → Advanced → SSH Access (e.g. `185.185.185.185`)

## Hostinger SFTP Connection

| Parameter | Value |
|-----------|-------|
| Host | FTP IP from hPanel → SSH Access |
| Port | **65002** (Hostinger-specific, not 22) |
| Username | FTP/SSH username from hPanel |
| Password | Same as FTP password (or use SSH key) |
| Remote path | `domains/mrsutherland.net/public_html/wp-content/uploads/` |

## Deployment Flow (Automated)

When deploying a web app bundle:

1. **Build** the app:
   ```bash
   cd [app-directory] && npm run build
   ```

2. **Connect** via SSH MCP:
   - Call `ssh_connect` with:
     - `host`: `89.116.53.253`
     - `port`: 65002
     - `username`: `u390745858`
     - `privateKeyPath`: `C:\Users\dsuth\.ssh\id_ed25519`

3. **Upload** the bundle:
   - Use `scp` via terminal (fastest) or `sftp_write` via MCP.
   - **Target Path**: `domains/mrsutherland.net/public_html/wp-content/uploads/[app-name]-app.js`

4. **Upload images** (if app has public images):
   - Create directory: `ssh_exec` with `mkdir -p domains/mrsutherland.net/public_html/wp-content/uploads/[app-folder]`
   - Upload images via `scp` or `sftp_write`.

5. **Disconnect**:
   - Call `ssh_disconnect` with the connectionId

6. **Clear cache**:
   - Use WordPress MCP or manual: LiteSpeed Cache → Purge All.

## SSH MCP Tools Used

| Tool | Purpose |
|------|---------|
| `ssh_connect` | Open connection; returns `connectionId` |
| `sftp_write` | Upload file (path + content) |
| `ssh_exec` | Run commands (e.g., `mkdir -p`, `ls -la`, `chmod`) |
| `sftp_ls` | List directory (verify upload) |
| `ssh_disconnect` | Close connection |

## Example: Deploy ai-scare-trade-story-app

```bash
# 1. Build
cd blog_posts/ai-scare-trade-schools && npm run build

# 2. Rename
cp dist/assets/index-*.js dist/assets/ai-scare-trade-story-app.js

# 3. Upload JS (Terminal SCP is often more robust for binary/large files)
scp -P 65002 -o StrictHostKeyChecking=no dist/assets/ai-scare-trade-story-app.js u390745858@89.116.53.253:domains/mrsutherland.net/public_html/wp-content/uploads/

# 4. Create Image Folder
# via ssh_exec: mkdir -p domains/mrsutherland.net/public_html/wp-content/uploads/ai-scare-trade

# 5. Upload Images
scp -P 65002 -o StrictHostKeyChecking=no public/images/* u390745858@89.116.53.253:domains/mrsutherland.net/public_html/wp-content/uploads/ai-scare-trade/
```

## Security Notes

- **Never commit** FTP password or SSH keys to the repo
- Store credentials in `.env.local` (gitignored) or provide when agent asks
- `SSH_MCP_ALLOWED_HOSTS` can restrict to Hostinger IPs for extra safety
- Prefer SSH key auth for passwordless automation

## Related

- Full deployment reference: [deployment.md](../wordpress-cms/references/deployment.md)
- WordPress MCP: for page updates and cache clearing
- Build config: Vite IIFE format per wordpress-cms skill
