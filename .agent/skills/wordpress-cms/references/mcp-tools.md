# WordPress MCP Tool Reference

All tools are provided by `@automattic/mcp-wordpress-remote` via the `wordpress-mcp` MCP server.
These are the **verified, live tool names** as exposed through Antigravity's MCP connection.

## Table of Contents
- [Posts](#posts) - wp_posts_search, wp_get_post, wp_add_post, wp_update_post
- [Pages](#pages) - wp_pages_search, wp_get_page, wp_add_page, wp_update_page
- [Media](#media) - wp_list_media, wp_search_media, wp_get_media, wp_get_media_file, wp_upload_media, wp_update_media
- [Taxonomy](#taxonomy) - wp_list_categories, wp_add_category, wp_update_category, wp_list_tags, wp_add_tag, wp_update_tag
- [Users](#users) - wp_users_search, wp_get_user, wp_get_current_user, wp_update_user, wp_update_current_user, wp_add_user
- [Custom Post Types](#custom-post-types) - wp_list_post_types, wp_cpt_search, wp_get_cpt, wp_add_cpt, wp_update_cpt
- [Site](#site) - get_site_info, wp_get_general_settings, wp_update_general_settings

---

## Posts

### `wp_posts_search` — search/list posts
```
params: {
  search?: string,
  status?: "publish" | "draft" | "pending" | "private" | "any",
  per_page?: number,     // default 10
  page?: number,
  categories?: object,   // { id: number }
  tags?: object,
  author?: number[],
  orderby?: "date" | "title" | "id" | "relevance",
  order?: "asc" | "desc"
}
returns: Post[]
```

### `wp_get_post` — get single post by ID
```
params: { id: number, context?: "view" | "edit" }
returns: Post  // full content, meta, categories, tags
```

### `wp_add_post` — create a new post
```
params: {
  title: string,
  content: string,          // HTML or Gutenberg block markup
  status?: "publish" | "draft" | "future" | "pending" | "private",
  categories?: number[],
  tags?: number[],
  featured_media?: number,
  excerpt?: string,
  slug?: string,
  sticky?: boolean
}
returns: Post  // includes id and link
```

### `wp_update_post` — update an existing post
```
params: {
  id: number,              // REQUIRED - get from wp_posts_search first
  title?: object,          // { rendered: string }
  content?: object,        // { rendered: string }
  status?: "publish" | "draft" | "future" | "pending" | "private",
  categories?: number[],
  tags?: number[],
  featured_media?: number,
  excerpt?: object,
  sticky?: boolean
}
returns: Post
```

---

## Pages

### `wp_pages_search` — search/list pages
```
params: { search?, status?, per_page?, page?, parent?, orderby?, order? }
returns: Page[]
```

### `wp_get_page` — get single page by ID
```
params: { id: number, context?: "view" | "edit" }
returns: Page
```

### `wp_add_page` — create a new page
```
params: { title, content, status?, parent?, slug?, template?, menu_order? }
returns: Page  // includes id and link
```

### `wp_update_page` — update an existing page
```
params: { id, title?, content?, status?, parent?, template?, menu_order? }
returns: Page
```

---

## Media

### `wp_list_media` — list all media items
```
params: { per_page?, page?, media_type?: "image"|"video"|"audio"|"application", orderby?, order? }
returns: Media[]
```

### `wp_search_media` — search media by title/caption/description
```
params: { search, per_page?, media_type?, mime_type? }
returns: Media[]
```

### `wp_get_media` — get a single media item by ID
```
params: { id: number, context?: "view" | "edit" }
returns: Media  // id, source_url, alt_text, media_type, mime_type, sizes
```

### `wp_get_media_file` — get the actual file blob of a media item
```
params: { id: number, size?: "thumbnail" | "medium" | "large" | "full" }
returns: file blob
```

### `wp_upload_media` — upload a new media file
```
params: {
  file: string,            // base64 encoded file
  title?: string,
  alt_text?: string,
  caption?: string,
  description?: string
}
returns: Media  // includes id and source_url
```

### `wp_update_media` — update media item metadata
```
params: { id, title?, alt_text?, caption?, description? }
returns: Media
```

---

## Taxonomy

### `wp_list_categories`
```
params: { per_page?, search?, hide_empty?, parent? }
returns: Category[]  // id, name, slug, count, parent
```

### `wp_add_category`
```
params: { name, slug?, parent?, description? }
returns: Category
```

### `wp_update_category`
```
params: { id, name?, slug?, parent?, description? }
returns: Category
```

### `wp_list_tags`
```
params: { per_page?, search?, hide_empty? }
returns: Tag[]  // id, name, slug, count
```

### `wp_add_tag`
```
params: { name, slug?, description? }
returns: Tag
```

### `wp_update_tag`
```
params: { id, name?, slug?, description? }
returns: Tag
```

---

## Users

### `wp_users_search`
```
params: { context: "edit", search?, roles?, per_page?, page? }
returns: User[]
```

### `wp_get_user`
```
params: { id: number, context?: "view" | "edit" }
returns: User
```

### `wp_get_current_user`
```
params: { context?: "view" | "edit" }
returns: User  // the authenticated user (user_id: 1)
```

### `wp_add_user`
```
params: { context: "edit", email, password, username?, first_name?, last_name?, roles? }
returns: User
```

### `wp_update_user` / `wp_update_current_user`
```
params: { id?, first_name?, last_name?, email?, password?, roles? }
returns: User
```

---

## Custom Post Types

### `wp_list_post_types`
```
params: { context?: "view" | "embed" | "edit" }
returns: PostType[]  // all registered CPTs including built-in post and page
```

### `wp_cpt_search` — search a specific CPT
```
params: { post_type: string, search?, status?, per_page?, page? }
returns: CPT[]
```

### `wp_get_cpt`
```
params: { post_type: string, id: number }
returns: CPT
```

### `wp_add_cpt`
```
params: { post_type, title, content, status?, excerpt? }
returns: CPT
```

### `wp_update_cpt`
```
params: { post_type, id, title?, content?, status?, excerpt? }
returns: CPT
```

---

## Site

### `get_site_info`
```
params: {}
returns: { site_name, site_url, site_description, site_admin_email, plugins, themes, users }
```
Site: "Mr Sutherland" | URL: https://mrsutherland.net | Admin: dsuth10@gmail.com

### `wp_get_general_settings`
```
params: {}
returns: { title, description, url, email, timezone, date_format, posts_per_page, ... }
```

### `wp_update_general_settings`
```
params: { title?, description?, timezone?, posts_per_page?, default_comment_status?, ... }
returns: updated settings
```

---

## Tips

- Always `wp_posts_search` or `wp_get_post` before `wp_update_post` -- you need the numeric `id`
- WordPress content field for updates takes an **object**: `{ rendered: "<p>HTML here</p>" }`
- For `wp_add_post` / `wp_add_page`, `content` is a plain **string**
- Gutenberg blocks use `<!-- wp:paragraph -->` comment wrappers; plain HTML also works
- The `link` field in responses gives the live public URL
- Category 1 = "Blog" (the default/only category on this site)
- Known post IDs: 162 (Flooding Sorter), 102 (AI Assessments), 91 (WEF Report), 89 (AI Automation), 77 (Unleashing AI)
