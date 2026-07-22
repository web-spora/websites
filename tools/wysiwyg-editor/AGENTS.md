# WYSIWYG Editor - AGENTS.md

## Project Overview
Vanilla JS WYSIWYG editor for CMS integration. Floating toolbar, tables, embeds, Word cleanup, read-only mode.

## Architecture
- **ES6 Modules** — no bundler, runs in browser via `<script type="module">`
- **Single root element** — event delegation for performance
- **CSS Custom Properties** — theming via `--wysiwyg-*` variables
- **ContentEditable** — core editing surface

## File Structure
```
src/
  editor.js        # Main Editor class, lifecycle, API
  toolbar.js       # Floating toolbar UI & positioning
  commands.js      # Formatting commands (execCommand + custom)
  tables.js        # Table operations (insert, edit, delete)
  embeds.js        # Image/video/link modals & insertion
  sanitizer.js     # HTML cleaning (allow-list, Word cleanup)
  api.js           # CMS integration: getContent/setContent
  readOnly.js      # Read-only mode toggle
  utils.js         # Selection, DOM, event helpers
styles/
  variables.css    # CSS custom properties
  editor.css       # Editor surface styles
  toolbar.css      # Toolbar & modal styles
demo/
  demo.html        # Demo page
  demo.js          # Demo initialization
```

## Coding Conventions
- **Naming**: PascalCase for classes, camelCase for functions/variables
- **Events**: `editor.on('event', handler)`, `editor.emit('event', data)`
- **Private methods**: prefix with `_` (e.g., `_initToolbar()`)
- **No external dependencies** — only browser APIs
- **Accessibility**: ARIA labels, keyboard navigation, focus management

## Key Patterns
```js
// Command pattern for formatting
const commands = {
  bold: () => document.execCommand('bold'),
  insertTable: (rows, cols) => { /* custom logic */ }
};

// Event emitter pattern
class Editor extends EventTarget {
  on(event, handler) { this.addEventListener(event, handler); }
  emit(event, detail) { this.dispatchEvent(new CustomEvent(event, { detail })); }
}
```

## Sanitizer Rules (Allow-List)
| Tags | Attributes |
|------|------------|
| p, br, strong, em, u, s, h1-h3, ul, ol, li, blockquote, code, pre, a, img, video, iframe, table, thead, tbody, tr, th, td | href, src, alt, target, rel, width, height, style (limited), colspan, rowspan |

**Strip**: `mso-*`, `style="mso-*"`, `class="Mso*"`, `<o:p>`, `<xml>`, `<!--[if...]>`

## Testing Checklist
- [ ] Toolbar appears on selection
- [ ] All formatting commands work
- [ ] Table: insert, add/remove row/col, merge, delete
- [ ] Embeds: image (base64/URL), video (YouTube), link
- [ ] Paste from Word → clean HTML
- [ ] getContent() returns sanitized HTML
- [ ] setContent(html) loads correctly
- [ ] Read-only mode toggles
- [ ] Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- [ ] Responsive on mobile
- [ ] Accessible (Tab navigation, screen readers)

## Build/Run
```bash
# No build step needed — open demo/demo.html in browser
# Or serve locally:
npx serve .
```