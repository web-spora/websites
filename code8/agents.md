# CODE8 — Digital Agency

## Project Overview

Premium landing page for CODE8, a full-cycle digital agency. Built with mobile-first approach, semantic HTML5, CSS3 with custom properties, and vanilla JavaScript.

## Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties (design tokens), Grid, Flexbox, responsive media queries
- **Vanilla JS** — IntersectionObserver for scroll animations, smooth navigation, counter animation

## Design System

All visual tokens are defined as CSS custom properties in `:root`:

| Token | Value |
|---|---|
| `--color-accent` | `#800211` |
| `--color-accent-hover` | `#60010D` |
| `--color-bg-main` | `#1C1C1C` |
| `--color-bg-card` | `#141414` |
| `--color-border` | `#474A51` |
| `--color-text-primary` | `#FFFFFF` |
| `--color-text-secondary` | `#B0B3B8` |
| `--font-main` | `'Montserrat', sans-serif` |

Typography uses `clamp()` for fluid scaling. Layout is capped at 1280px container width.

## Structure

```
/
├── index.html          # Main landing page
├── agents.md           # This file
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # All interactivity
├── assets/
│   └── images/         # Portfolio images, logos
└── material/           # Source design files (PSD, PDF, etc.)
```

## Sections

1. **Header** — fixed navigation with mobile hamburger menu
2. **Hero** — full-viewport intro with CTA buttons
3. **About** — agency description + stats counter
4. **Services** — 4 service cards (Branding, Web, Design, Marketing)
5. **Works** — portfolio grid with hover overlays
6. **Contact** — contact form + info + social links
7. **Footer** — brand, navigation, copyright

## Performance Optimizations

- `loading="lazy"` on portfolio images
- `defer` on script loading
- `preconnect` for Google Fonts
- Backdrop blur for header with `will-change` friendly properties
- Passive scroll listener

## Lighthouse Targets

- Performance > 90
- Accessibility > 95
- SEO > 95
- Best Practices > 90

## Local Development

Open `index.html` directly in a browser, or serve locally:

```bash
npx serve .
```

## Conventions

- 2-space indentation in CSS
- BEM-like class naming
- No inline styles
- No external dependencies (zero npm packages)
- Icons use inline SVG via `currentColor`
