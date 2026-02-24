# CB Media Studio — Dark Overhaul Design

> Approved 2026-02-23. Transform the Sanity Studio from a cream/white default-feeling CMS into a dark, branded, premium editing experience that matches CB Media's cinematic identity.

## Approach

**Option 2: Dark Theme + Rebuilt Welcome Dashboard.** Not just a CSS reskin — rebuild the welcome dashboard with proper hierarchy, remove filler, and apply the design constitution throughout.

## Brand Tokens (from designs/cb-media/brand.md)

```
Background:        oklch(0.05 0 0)   — near-black
Foreground:        oklch(0.98 0 0)   — near-white
Accent/Gold:       oklch(0.7 0.08 70) / #E8C872
Card surface:      oklch(0.08 0 0)   — subtle elevation
Border:            oklch(0.2 0 0)    — subtle divider
Muted text:        oklch(0.5 0 0)
Fonts:             Montserrat (display), Space Grotesk (UI), Inter (body)
```

## Section 1: Dark Theme Foundation (sanity.config.ts)

Flip `buildLegacyTheme` from cream to dark:

| Token | Current | New |
|-------|---------|-----|
| `--black` (text) | `#2d2926` | `#E8E4DE` |
| `--white` (bg) | `#f7f4f0` | `#111010` |
| `--gray-base` | `#faf8f5` | `#161514` |
| `--gray` | `#8a8279` | `#6B6560` |
| `--component-bg` | `#fefcfa` | `#1A1918` |
| `--component-text-color` | `#2d2926` | `#E8E4DE` |
| `--main-navigation-color` | `#f0ebe4` | `#111010` |
| `--brand-primary` | `#E8C872` | `#E8C872` (unchanged) |
| `--focus-color` | `#E8C872` | `#E8C872` (unchanged) |

## Section 2: Navbar (StudioNavbar.tsx)

- Dark background inherited from theme
- "CB" gold, "MEDIA" warm white, "Studio" muted — same structure, crisper on dark
- Gold 1px bottom border for subtle separation
- No structural changes — Sanity nav items inherit dark theme

## Section 3: Welcome Dashboard (StudioWelcome.tsx)

**Header:**
- "CB MEDIA" gold + "Content Studio" warm white on dark
- Subtext: concise welcome message
- Gold underline retained

**Stats Row (3-4 cards):**
- Dark card surfaces (#1A1918) with 1px border at ~8% white opacity
- Gold 2px left-border accent on each card
- Numbers: large, tabular-nums, focal point
- Labels: overline style (11px, uppercase, muted)
- 4th card (Drafts) appears conditionally when drafts > 0

**Quick Actions → Individual cards (not a list):**
- Each action is its own dark card
- SVG icons (not emoji) — monoline, gold-tinted
- Bold title + muted description
- Hover: subtle background shift + translateY(-1px)
- Focus-visible ring for keyboard nav
- Remove "Preview Site" from actions → becomes a link in header area

**Removed:**
- "Tip of the Day" — filler, violates restraint principle
- Emoji icons throughout — replaced with SVG

**Drafts warning:** Dark caution card with amber left-border, no emoji.

## Section 4: Global CSS (studio.css)

- Remove graph paper grid background
- Dark sidebar with gold left-border on active items (keep)
- Hover states: subtle warm background shift
- Tab bar: gold underline on active (keep), dark bg
- Form inputs: gold focus ring (keep), dark input backgrounds
- `::selection` — gold bg with dark text
- Scrollbar styling for dark theme

## Out of Scope

- Schema structure (sections, siteSettings, stats)
- Document editing form fields (inherit dark theme automatically)
- Presentation/Vision tool theming (self-managed)
- IframePreview component
