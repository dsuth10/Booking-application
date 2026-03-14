# Project Conventions — mrsutherland.net

Source of truth: `.cursorrules` in the repo root.

## Technology Stack

| Layer | Choice |
|-------|--------|
| Frontend | React (latest stable) + TypeScript |
| Build tool | Vite (preferred) |
| Styling | Tailwind CSS via CDN, or CSS Modules |
| Bundle format | **IIFE** (self-contained, for WP embedding) |
| Hosting | Hostinger (hPanel) |
| CMS | WordPress, managed via MCP tools |

## TypeScript Rules

- Explicit types for all props, state, function params
- Prefer `interface` over `type` for object shapes
- `React.FC<Props>` or typed function params for components
- No `any` -- use `unknown` or proper types
- Strict mode enabled

## React Patterns

```typescript
// Component template
import React from 'react';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (/* JSX */);
};

export default ComponentName;
```

- Functional components with hooks only (no class components)
- `useState` / `useEffect` for state and side effects
- `useCallback` for handlers passed to children
- `useMemo` for expensive computations
- Extract reusable logic into custom hooks
- Keep components small, single-responsibility
- Named exports for components

## File Organisation

```
[app-name]/
  src/
    components/     # PascalCase.tsx
    types.ts        # or types/ directory
    constants.ts
    App.tsx
    main.tsx        # entry point
  package.json
  vite.config.ts
  tsconfig.json
```

- App directories: **kebab-case** (e.g., `my-web-app`)
- Component files: **PascalCase** (e.g., `StudentCard.tsx`)
- Utilities/constants: **kebab-case** (e.g., `date-utils.ts`)
- Bundle output: `[app-name]-app.js`
- WP page slugs: kebab-case matching app purpose

## Full-Width Layout (MANDATORY for all apps)

Every app MUST break out of WordPress's container. Include in the WP HTML block:

```html
<style>
#app-wrapper {
  width: 100vw !important;
  max-width: 100vw !important;
  margin-left: calc(-50vw + 50%) !important;
  margin-right: calc(-50vw + 50%) !important;
  position: relative !important;
  left: 0 !important;
  right: 0 !important;
}
#root {
  width: 100% !important;
  max-width: none !important;
}
#root > div {
  width: 100vw !important;
  max-width: none !important;
  margin-left: calc(-50vw + 50%) !important;
  margin-right: calc(-50vw + 50%) !important;
}
</style>
```

For React inline styles on the main app container:
```typescript
style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}
```

## WordPress Plugin PHP Conventions

```php
<?php
if (!defined('ABSPATH')) exit;  // Always first

// Use WP hooks, not inline output
add_filter('upload_mimes', 'my_allow_js_uploads');
function my_allow_js_uploads($mimes) {
    $mimes['js'] = 'application/javascript';
    return $mimes;
}

// Nonces for form submissions
wp_nonce_field('my_action', 'my_nonce');
if (!wp_verify_nonce($_POST['my_nonce'], 'my_action')) { die(); }
```

- PHP plugins go in the **root directory** (not per-app dirs)
- Follow WordPress coding standards (snake_case functions, prefixed names)
- Use hooks (`wp_head`, `wp_footer`, `wp_enqueue_scripts`) with appropriate priority
- JS via `wp_enqueue_scripts`, not inline templates

## Performance Targets

- Bundle size: < 500KB gzipped
- Use `React.memo` for components that don't need frequent re-renders
- Lazy load heavy components when appropriate
- Minimize dependency arrays in hooks

## Accessibility

- `aria-label` on icons and visual elements
- Semantic HTML (`main`, `header`, `nav`, etc.)
- Keyboard navigation support
- Proper heading hierarchy (one `h1` per page)
- Alt text on all images
- WCAG colour contrast ratios

## Git

Do NOT commit:
- `node_modules/`
- `.env.local` or any secrets
- `dist/` build artifacts
- `Thumbs.db`, `.DS_Store`
- `.cursor/` (contains MCP credentials)
