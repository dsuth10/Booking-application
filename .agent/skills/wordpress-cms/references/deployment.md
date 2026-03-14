# Deployment Reference — mrsutherland.net

## Build

```bash
# From inside the app directory (e.g. ./my-web-app/)
npm run build
```

Output: `dist/assets/[hash]-app.js` (Vite default)

Rename to consistent name:
```bash
# PowerShell
Copy-Item dist/assets/*.js dist/assets/my-web-app-app.js
```

**Vite IIFE config** (required for WordPress embedding):
```js
// vite.config.ts
export default {
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'App',
      formats: ['iife'],
      fileName: () => 'my-web-app-app.js'
    },
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  }
}
```

## Upload to Hostinger

### Method 1: hPanel File Manager (fastest)
1. Login: https://hpanel.hostinger.com
2. Files -> File Manager
3. Navigate to: `public_html/wp-content/uploads/`
4. Click Upload -> select `[app-name]-app.js`
5. File is live at: `https://mrsutherland.net/wp-content/uploads/[app-name]-app.js`

### Method 2: SFTP (manual — FileZilla / WinSCP)
- Host: FTP IP from hPanel -> Advanced -> SSH Access
- Port: **65002** (not 22 or 21)
- Protocol: SFTP
- Username/Password: same as FTP account credentials
- Target path: `/public_html/wp-content/uploads/`

Enable SSH first: hPanel -> Hosting -> Advanced -> SSH Access -> Enable

### Method 3: SSH MCP / SCP (automated — recommended)
Use the **mcp-server-ssh** MCP server or terminal `scp` with the **deploy-hostinger** skill:

1. **Host**: `89.116.53.253`
2. **Port**: `65002`
3. **User**: `u390745858`
4. **Target Path**: `domains/mrsutherland.net/public_html/wp-content/uploads/`

**SCP Example**:
```bash
scp -P 65002 -o StrictHostKeyChecking=no dist/assets/app.js u390745858@89.116.53.253:domains/mrsutherland.net/public_html/wp-content/uploads/
```

Full workflow: see `.agent/skills/deploy-hostinger/SKILL.md`

### Allow .js uploads via WordPress media library (optional)
Add to `wp-content/themes/[theme]/functions.php`:
```php
function allow_js_uploads($mimes) {
    $mimes['js'] = 'application/javascript';
    return $mimes;
}
add_filter('upload_mimes', 'allow_js_uploads');
```
(The `allow-js-uploads.php` file in the project root has this code ready.)

## Create/Update WordPress Page with MCP

Use `wp_add_page` or `wp_update_page`. Pass the full HTML block as `content`.

Use the embed template in `assets/wordpress-embed-template.html` as the page content.
Replace `APP_NAME` with the actual app name.

```python
# Example MCP call pattern
wp_update_page(id=PAGE_ID, content=open('assets/wordpress-embed-template.html').read())
```

## Clear Cache (REQUIRED after every deployment)

1. WP Admin -> LiteSpeed Cache -> Purge All
2. Hard refresh in browser: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

## Deployment Checklist

- [ ] App builds successfully (`npm run build`)
- [ ] Bundle renamed to `[app-name]-app.js`
- [ ] File uploaded to `/wp-content/uploads/`
- [ ] File accessible at `https://mrsutherland.net/wp-content/uploads/[app-name]-app.js`
- [ ] WordPress page created/updated with embed HTML block
- [ ] Full-width CSS included in HTML block
- [ ] Tailwind CDN script tag present (if using Tailwind)
- [ ] LiteSpeed cache cleared
- [ ] Tested on live site (Chrome + responsive check)
