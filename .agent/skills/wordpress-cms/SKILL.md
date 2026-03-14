---
name: wordpress-cms
description: WordPress content management and web app deployment for mrsutherland.net (hosted on Hostinger). Use when: editing or creating blog posts/pages, embedding React/JS web apps into WordPress, deploying built JavaScript bundles to Hostinger, managing WordPress media or taxonomy, or any task involving the WordPress MCP tools (wp_get_posts, wp_add_post, wp_update_post, wp_add_page, wp_update_page, etc.). Also use when building new web apps that will be embedded in this WordPress site.
---

# wordpress-cms

Site: **mrsutherland.net** | Host: **Hostinger (hPanel)** | Auth: **JWT Token** (via `wordpress-mcp` MCP server)

## MCP Tool Usage

Use WordPress MCP tools for all content operations. Never manually edit WordPress unless MCP fails.

Core tools: `wp_get_posts`, `wp_add_post`, `wp_update_post`, `wp_add_page`, `wp_update_page`, `wp_get_media`, `wp_upload_media`

- Full tool reference with params: see [mcp-tools.md](references/mcp-tools.md)
- Always fetch existing content before updating to preserve fields you are not changing

## Blog Post / Page Workflow

1. **Read first**: `wp_get_posts` or `wp_get_pages` to get current content + IDs
2. **Edit**: Modify the content (HTML or block markup)
3. **Write**: `wp_update_post` / `wp_update_page` with the post/page ID
4. **Verify**: Confirm the response shows `status: publish` and correct content

For new posts: use `wp_add_post` with `status: "publish"` or `"draft"`.

## Web App Deployment Workflow

When building/deploying a React or JS web app into WordPress:

1. **Build**: `npm run build` -- output goes to `dist/assets/`
2. **Rename**: Copy hash-named bundle to `[app-name]-app.js`
3. **Upload**: Via hPanel File Manager, SFTP (FileZilla), or **SSH MCP** (see `deploy-hostinger` skill)
4. **WordPress page**: Use `wp_add_page` or `wp_update_page` with the embed HTML block
5. **Clear cache**: LiteSpeed Cache plugin in WP Admin

Full deployment details: see [deployment.md](references/deployment.md)
Full-width embed HTML block template: see [assets/wordpress-embed-template.html](assets/wordpress-embed-template.html)

## Code Conventions

All web apps in this repo follow the patterns defined in [project-conventions.md](references/project-conventions.md).

Key rules:
- Build as **IIFE** (Vite: `build.lib.formats: ['iife']`) -- self-contained, no external deps
- Full-width layout is **mandatory** for all apps (override WordPress container)
- TypeScript preferred; strict types, no `any`
- Tailwind CSS via CDN in the WordPress HTML block

## Hostinger Quick Reference

| Task | Method |
|------|--------|
| Upload JS file | hPanel File Manager, SFTP (port 65002), or SSH MCP |
| SSH MCP (automated) | See `deploy-hostinger` skill |
| Clear cache | WP Admin -> LiteSpeed Cache -> Purge All |
| WordPress Admin | `https://mrsutherland.net/wp-admin` |
