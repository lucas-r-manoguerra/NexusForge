# NexusForge Design System

## Brand Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `gray-950` (#030712) | Page background |
| `--color-text-primary` | `white` | Primary text |
| `--color-accent` | `blue-600` (#2563eb) | Interactive elements |
| `--color-accent-hover` | `blue-500` (#3b82f6) | Hover states |

### Typography

| Element | Tailwind Class | Description |
|---------|---------------|-------------|
| Page title | `text-4xl font-bold` | Main heading |
| Counter value | `text-2xl` | Displayed numeric value |
| Button | `font-medium` | Action labels |

### Spacing

- **Layout gap**: `gap-4` (1rem) between elements in flex containers
- **Section margin**: `mb-8` (2rem) below main heading
- **Button padding**: `px-4 py-2` (1rem horizontal, 0.5rem vertical)

### Layout

- **Page**: `min-h-screen flex items-center justify-center` — vertically and horizontally centered
- **Content alignment**: `text-center` on main container
- **Component alignment**: `flex flex-col items-center` for stacked interactive elements

## Component Inventory

| Component | File | Description |
|-----------|------|-------------|
| Counter | `src/components/Counter.tsx` | Incrementing counter with button |

## Design Principles

1. **Dark-first**: Dark backgrounds (`gray-950`) with light text — reduces eye strain for developers
2. **Tailwind-native**: All styling via Tailwind CSS utility classes — no custom CSS beyond `@import "tailwindcss"`
3. **Minimal UI**: Components are functional and unstyled beyond Tailwind utilities — no design library dependency
4. **Accessible contrast**: White text on `gray-950` exceeds WCAG AAA contrast ratio
