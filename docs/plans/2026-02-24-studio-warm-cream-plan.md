# Studio Warm Cream Theme — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the dark Sanity Studio theme with a warm cream light theme matching Dev Dash / Discovery Hub aesthetic.

**Architecture:** Use `buildLegacyTheme` with light-palette values (reliable, stable API) + a clean ~80-line `studio.css` for font overrides and surface fine-tuning. Update inline styles in StudioWelcome and StudioNavbar components to match. No schema, plugin, or query changes.

**Tech Stack:** Sanity v5, @sanity/ui, Next.js 16, CSS

**Design doc:** `docs/plans/2026-02-24-studio-warm-cream-theme-design.md`

---

## Token Reference

These values are used across all tasks:

```
ACCENT:     #C4875A   (warm amber — primary actions, focus, active states)
ACCENT_HVR: #B3764A   (darker amber — hover)
TEXT:        #2C2825   (warm near-black — primary text)
MUTED:       #8A8279   (warm gray — secondary text, placeholders)
SURFACE:     #FFFFFF   (cards, inputs, elevated areas)
BG:          #F5F0EB   (warm cream — page background)
SIDEBAR_BG:  #FAF7F4   (slightly lighter cream — sidebar)
BORDER:      rgba(0,0,0,0.08)  (subtle warm dividers)
FONT_UI:     "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
SUCCESS:     #4A8C5C
WARNING:     #C49A3C
DANGER:      #C45A5A
INFO:        #4A7FB5
```

---

### Task 1: Switch theme palette in sanity.config.ts

**Files:**
- Modify: `sanity.config.ts:1-33`

**Step 1: Update the buildLegacyTheme call**

Replace the entire theme block (lines 14–33) with light palette values:

```typescript
const theme = buildLegacyTheme({
  '--black': '#2C2825',
  '--white': '#F5F0EB',
  '--gray-base': '#F5F0EB',
  '--gray': '#8A8279',
  '--component-bg': '#FFFFFF',
  '--component-text-color': '#2C2825',
  '--brand-primary': '#C4875A',
  '--default-button-color': '#C4875A',
  '--default-button-primary-color': '#C4875A',
  '--default-button-success-color': '#4A8C5C',
  '--default-button-warning-color': '#C49A3C',
  '--default-button-danger-color': '#C45A5A',
  '--state-info-color': '#4A7FB5',
  '--state-success-color': '#4A8C5C',
  '--state-warning-color': '#C49A3C',
  '--state-danger-color': '#C45A5A',
  '--focus-color': '#C4875A',
  '--main-navigation-color': '#FAF7F4',
})
```

No import changes needed — `buildLegacyTheme` is already imported.

**Step 2: Verify build**

Run: `pnpm build`
Expected: Compiles successfully, no errors.

**Step 3: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(studio): switch theme palette to warm cream"
```

---

### Task 2: Rewrite studio.css for light theme

**Files:**
- Rewrite: `src/sanity/studio.css` (replace entire contents)

**Step 1: Replace studio.css with light-theme styles**

The old file was 230+ lines fighting a dark theme. The new file is ~90 lines for a light theme that mostly works out of the box. Replace the entire file with:

```css
/* ── Font — Inter for all Studio UI ── */
[data-ui='Text'],
[data-ui='Heading'],
[data-ui='Label'],
[data-ui='Tab'] {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

[data-ui='TextInput'] input,
[data-ui='TextInput'] textarea,
[data-ui='TextArea'] textarea,
[data-testid='pt-editor'] [contenteditable] {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* ── Warm cream surfaces ── */
[data-ui='ToolScreen'],
[data-ui='Pane'] > [data-ui='PaneContent'] {
  background-color: #F5F0EB;
}

/* ── Accent on active nav tab ── */
[data-ui='Tab'][data-selected] {
  border-bottom-color: #C4875A !important;
}

/* ── Active sidebar item ── */
[data-ui='TreeItem'][data-selected] > [data-ui='Flex'] {
  border-left: 2px solid #C4875A;
  background-color: rgba(196, 135, 90, 0.06);
}

/* ── Sidebar hover ── */
[data-ui='TreeItem']:hover > [data-ui='Flex'] {
  background-color: rgba(196, 135, 90, 0.04);
}

/* ── Tab bar ── */
[data-ui='TabList'] {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* ── Inputs — clean white, subtle border ── */
[data-ui='TextInput'],
[data-ui='TextArea'] {
  background-color: #FFFFFF !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 6px !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
}

[data-ui='TextInput']:focus-within,
[data-ui='TextArea']:focus-within {
  border-color: #C4875A !important;
  box-shadow: 0 0 0 1px rgba(196, 135, 90, 0.3) !important;
}

/* ── Portable Text editor ── */
[data-testid='pt-editor'] {
  background-color: #FFFFFF !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 6px !important;
}

[data-testid='pt-editor']:focus-within {
  border-color: #C4875A !important;
  box-shadow: 0 0 0 1px rgba(196, 135, 90, 0.3) !important;
}

/* ── Selection color ── */
::selection {
  background: rgba(196, 135, 90, 0.25);
  color: #2C2825;
}

/* ── Scrollbar — scoped to Studio ── */
html.sanity-studio * {
  scrollbar-width: thin;
  scrollbar-color: #D5CEC7 #F5F0EB;
}

html.sanity-studio ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

html.sanity-studio ::-webkit-scrollbar-track {
  background: #F5F0EB;
}

html.sanity-studio ::-webkit-scrollbar-thumb {
  background: #D5CEC7;
  border-radius: 4px;
}

html.sanity-studio ::-webkit-scrollbar-thumb:hover {
  background: #C0B8B0;
}

/* ── Navbar border ── */
[data-ui='Navbar'] {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

/* ── Publish button ── */
[data-testid="action-publish"] {
  background-color: #C4875A !important;
  color: #FFFFFF !important;
}

[data-testid="action-publish"]:hover {
  background-color: #B3764A !important;
}

/* ── Selected button/chip (active toggle state) ── */
[data-ui="Button"][data-selected] {
  background-color: rgba(196, 135, 90, 0.1) !important;
  color: #C4875A !important;
  border-color: rgba(196, 135, 90, 0.2) !important;
}

/* ── Field group tabs ── */
[data-ui="TabList"] [data-ui="Tab"]:not([data-selected]) {
  color: #8A8279 !important;
}

[data-ui="TabList"] [data-ui="Tab"]:not([data-selected]):hover {
  color: #5A5550 !important;
  background-color: rgba(0, 0, 0, 0.03) !important;
}

[data-ui="TabList"] [data-ui="Tab"][data-selected] {
  color: #2C2825 !important;
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add src/sanity/studio.css
git commit -m "feat(studio): rewrite CSS for warm cream light theme"
```

---

### Task 3: Update StudioNavbar component

**Files:**
- Modify: `src/sanity/components/StudioNavbar.tsx`

**Step 1: Update inline styles to warm palette**

Replace the entire component with:

```tsx
import type { NavbarProps } from 'sanity'
import { Flex, Text } from '@sanity/ui'

export function StudioNavbar(props: NavbarProps) {
  return (
    <Flex align="center">
      <Flex
        align="center"
        gap={2}
        paddingLeft={4}
        paddingRight={3}
        style={{ whiteSpace: 'nowrap' }}
      >
        <Text
          size={1}
          weight="bold"
          style={{
            fontFamily: '"Inter", -apple-system, sans-serif',
            letterSpacing: '0.14em',
          }}
        >
          <span style={{ color: '#C4875A' }}>CB</span>{' '}
          <span style={{ color: '#2C2825' }}>MEDIA</span>
        </Text>
        <Text
          size={0}
          style={{
            color: '#8A8279',
            letterSpacing: '0.08em',
            fontFamily: '"Inter", -apple-system, sans-serif',
          }}
        >
          Studio
        </Text>
      </Flex>
      {props.renderDefault(props)}
    </Flex>
  )
}
```

Changes: gold→amber for "CB", cream→dark for "MEDIA", Space Grotesk→Inter.

**Step 2: Commit**

```bash
git add src/sanity/components/StudioNavbar.tsx
git commit -m "feat(studio): update navbar to warm cream palette"
```

---

### Task 4: Update StudioWelcome component

**Files:**
- Modify: `src/sanity/components/StudioWelcome.tsx`

**Step 1: Replace token constants (top of file, lines 5-12)**

```typescript
/* ── Tokens ── */
const ACCENT = '#C4875A'
const TEXT = '#2C2825'
const MUTED = '#8A8279'
const SURFACE = '#FFFFFF'
const BG = '#F5F0EB'
const BORDER = 'rgba(0,0,0,0.08)'
const HOVER_BG = 'rgba(196,135,90,0.04)'
const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
```

**Step 2: Update all style references throughout the component**

Every reference to the old tokens needs updating:

| Old token | New token | Occurrences |
|-----------|-----------|-------------|
| `GOLD` | `ACCENT` | ~8 (accent borders, text highlights, caret) |
| `TEXT` | `TEXT` | ~6 (same name, new value — auto) |
| `MUTED` | `MUTED` | ~5 (same name, new value — auto) |
| `SURFACE` | `SURFACE` | ~4 (same name, new value — auto) |
| `BORDER` | `BORDER` | ~2 (same name, new value — auto) |
| `HOVER_BG` | `HOVER_BG` | ~1 (same name, new value — auto) |
| `FONT_UI` | `FONT_UI` | ~8 (same name, new value — auto) |
| `'#111010'` (bg) | `BG` | 1 (root container bg) |
| `'#c9960c'` (draft) | `'#C49A3C'` | 3 (draft warning color) |

Specific changes needed in the JSX:
- Root container `backgroundColor: '#111010'` → `backgroundColor: BG`
- All `color: GOLD` → `color: ACCENT`
- `borderLeftColor: GOLD` in cardStyle → `borderLeftColor: ACCENT`
- `borderLeft: \`2px solid ${GOLD}\`` in cardStyle → `borderLeft: \`2px solid ${ACCENT}\``
- Draft warning `'#c9960c'` → `'#C49A3C'`
- Gold `'#E8C872'` underline div → `ACCENT`

**Step 3: Verify build**

Run: `pnpm build`
Expected: Compiles successfully.

**Step 4: Commit**

```bash
git add src/sanity/components/StudioWelcome.tsx
git commit -m "feat(studio): update welcome dashboard to warm cream palette"
```

---

### Task 5: Visual verification + final commit

**Step 1: Start dev server**

Run: `pnpm dev`
Navigate to: `http://localhost:3007/studio`

**Step 2: Visual checklist**

Verify each of these in the browser:

- [ ] Page background is warm cream (#F5F0EB), not white or dark
- [ ] Cards/inputs are white (#FFFFFF) on cream — visible elevation
- [ ] Text is warm dark (#2C2825), readable
- [ ] Navbar says "CB MEDIA Studio" — "CB" in amber, "MEDIA" in dark
- [ ] Active tab has amber underline
- [ ] Sidebar active item has amber left border
- [ ] Input fields have white bg, subtle border, amber focus ring
- [ ] Publish button is amber with white text
- [ ] Scrollbars are thin warm gray on cream
- [ ] Welcome dashboard stats/cards use warm palette
- [ ] Font is Inter throughout (not Space Grotesk or system default)
- [ ] Main site (/) still has dark theme — unaffected

**Step 3: Stop dev server, run full build**

Run: `pnpm build`
Expected: Clean build, no errors.

**Step 4: Final commit + push**

```bash
git add -A
git commit -m "feat(studio): warm cream theme — visual verification pass"
git push origin main
```

---

## Notes

- **Why not `buildTheme`?** It's marked `@internal` in @sanity/ui and requires complex font size array definitions. `buildLegacyTheme` + CSS gives the same visual result with zero API risk. We can migrate to `buildTheme` later if Sanity stabilizes the API.
- **No test files.** This is a CSS/styling change. Build verification confirms no syntax errors. Visual verification confirms the design intent.
- **The `sanity-studio` class toggle** in `src/app/studio/[[...tool]]/page.tsx` stays as-is — it correctly scopes scrollbar styles.
- **No schema or query changes.** Content, plugins, and structure are untouched.
