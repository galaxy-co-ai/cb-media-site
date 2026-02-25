# Studio Theme Redesign: Warm Cream

**Date:** 2026-02-24
**Status:** Approved
**Supersedes:** 2026-02-23-studio-dark-overhaul-design.md

## Context

The Sanity Studio at `/studio` currently uses a dark theme (`buildLegacyTheme` with inverted black/white) plus 230+ lines of CSS overrides to fix visibility issues. The dark approach requires constant fighting with Sanity's internals.

The new direction: a warm, light cream theme matching the aesthetic of Dev Dash and Discovery Hub — our other internal tools. The Studio is a backend tool (Tareq never sees it alongside the site), so visual separation from the dark CB Media website is a feature, not a bug.

## Reference

- **Dev Dash screenshots** — warm cream bg, clean cards, amber accents, Inter typography
- **Discovery Hub screenshots** — same palette family, amber/copper focus rings, generous spacing
- **Design constitution** — `designs/CLAUDE.md` (firm rules on spacing, motion, states, accessibility)

## Theme API

Switching from `buildLegacyTheme` (colors only) to `buildTheme` from `@sanity/ui/theme` (full control over palette, fonts, radius, spacing, shadows, button/input/card styling).

## Color Palette

| Token | Value | Purpose |
|-------|-------|---------|
| Background | `#F5F0EB` | Warm cream page bg |
| Surface/Card | `#FFFFFF` | Cards, inputs, elevated areas |
| Text | `#2C2825` | Primary text (warm near-black) |
| Muted text | `#8A8279` | Secondary text, placeholders, labels |
| Accent | `#C4875A` | Active states, focus rings, publish button |
| Accent hover | `#B3764A` | Darker accent for hover |
| Border | `rgba(0,0,0,0.08)` | Subtle warm borders |
| Sidebar bg | `#FAF7F4` | Slightly lighter than page |
| Sidebar active bg | `rgba(196,135,90,0.08)` | Active item highlight |
| Success | `#4A8C5C` | Publish success, positive states |
| Warning | `#C49A3C` | Draft indicators, caution |
| Danger | `#C45A5A` | Delete, destructive actions |

## Typography

| Role | Font | Weight |
|------|------|--------|
| All UI (text, heading, label) | Inter | 400 body, 500 labels, 600 headings |
| Code | System monospace stack | 400 |

Inter is already loaded in the CB Media project layout. No new font imports needed.

## Key Behaviors

- **Publish button** — accent bg (#C4875A), white text, darkens on hover
- **Active tabs/chips** — accent text + subtle accent bg
- **Focus rings** — accent box-shadow, not outline
- **Inputs** — white bg, subtle border, clean flat style (no neumorphism)
- **Sidebar** — clean list, accent left-border on active item, subtle hover bg
- **Hover states** — background shift only, no transforms
- **Scrollbars** — thin, warm gray thumb on cream track (Studio only via .sanity-studio class)

## Files to Change

| File | Action |
|------|--------|
| `sanity.config.ts` | Replace `buildLegacyTheme` with `buildTheme` — palette, fonts, radius |
| `src/sanity/studio.css` | Gut and rewrite — light-theme overrides for gaps the theme API can't cover |
| `src/sanity/components/StudioWelcome.tsx` | Update inline tokens to warm cream palette |
| `src/sanity/components/StudioNavbar.tsx` | Update to warm palette |
| `src/app/studio/[[...tool]]/page.tsx` | Keep sanity-studio class toggle, may simplify |
| `src/app/globals.css` | No changes needed |

## Files NOT Changed

- Sanity schemas, queries, content logic
- Lenis/scroll scoping (already working)
- Plugin configuration
- CB Media website dark theme (completely separate)
