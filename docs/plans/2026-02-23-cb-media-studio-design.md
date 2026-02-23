# CB Media Studio — Premium CMS Design

> Transform the default Sanity Studio into a branded, intuitive content hub for a non-technical client who edits weekly.

## Context

- **Client:** Tareq Othman (CB Media) — non-technical, regular content updates
- **Pain points:** Generic look, confusing navigation, no visual feedback when editing
- **Client quote:** Explicitly requested the ability to see what changes look like on the live site while editing
- **Approach:** B (Branded Content Hub) — theme + nav + dashboard + live preview
- **Schemas:** 3 (section, siteSettings, stat) — lean surface, ~20 fields total

## 1. Brand Theme

Replace generic dark theme with CB Media's visual identity via `buildLegacyTheme()`.

| Variable | Value | Reason |
|---|---|---|
| `--black` | `#0a0a0a` | Matches oklch(0.05) background |
| `--white` | `#f0f0f0` | Soft white, not pure |
| `--gray-base` | `#141414` | oklch(0.08) card surface |
| `--component-bg` | `#111111` | Keep |
| `--component-text-color` | `#e0e0e0` | 85-90% white per design constitution |
| `--brand-primary` | `#E8C872` | Warm gold from oklch(0.7 0.08 70) — CB Media signature |
| `--focus-color` | `#E8C872` | Gold focus rings |
| `--main-navigation-color` | `#0a0a0a` | Deep black nav |

### Navbar

- "CB" in warm gold + "MEDIA" in white, Space Grotesk 600, tracking 0.12em
- Subtle divider, then "Studio" in muted white
- Uses `@sanity/ui` components, not inline styles

### Favicon

- CB monogram or "CB" lettermark in gold accent
- Replaces default Sanity icon in browser tab

## 2. Welcome Dashboard

Replaces current generic card stack. Centered, max-width 560px.

### Layout (top to bottom)

1. **Header** — "CB MEDIA Content Studio" in brand typography
2. **Status cards** (row) — published section count + last edited timestamp via GROQ
3. **Quick actions** (unified list) — rows with icon, title, description, arrow
   - Edit Homepage Sections → structure/section
   - Update Hero & Contact Info → structure/siteSettings
   - Open Visual Editor → presentation tool
4. **Getting Started** — subtle bordered card (tone="default"), bullet tips
5. **View Live Site** — ghost button, opens in new tab

### Principles

- Plain English everywhere — no Sanity jargon
- `@sanity/ui` primitives inherit brand theme automatically
- No inline style colors — theme handles it

## 3. Sidebar Structure

Replace flat list with intent-based navigation.

```
YOUR WEBSITE
─────────────────
🏠  Home                    → Dashboard
─────────────────
✏️  Hero & Branding          → siteSettings singleton (direct to form)
─────────────────
📄  Homepage Sections
    ├── All Sections         → ordered by position (default)
    ├── Visible on Site      → filter: isVisible == true
    └── Hidden               → filter: isVisible == false
─────────────────
👁  Visual Editor            → Presentation tool (live preview)
```

### Document list previews

Each section row shows: `#{order} • Section Title • 🟢/⚫` (visibility badge).

### Key decisions

- "Hero & Branding" not "Site Settings"
- Sub-filters for visible/hidden sections
- Visual Editor as top-level nav item (the premium feature, not buried)
- Root title: "YOUR WEBSITE"

## 4. Schema Polish

Every field gets a plain-English title and description. If Tareq has to think about what it means, we failed.

### Section

| Field | Title | Description |
|---|---|---|
| title | Section Title | The heading visitors see for this section |
| content | Section Content | The main text and images for this section |
| stats | Key Numbers | Animated statistics like '+193% ROI' in a grid |
| serviceItems | Service Cards | Cards with a title, description, and button |
| slug | **Hidden** | Auto-generated, Tareq never touches it |
| order | Position | What order this appears on the page (1 = first) |
| isVisible | Show on Website | Turn off to hide without deleting |

### Service item fields

| Field | Title | Description |
|---|---|---|
| ctaText | Button Text | What the button says (e.g. 'Learn More') |
| ctaLink | Button Link | Where the button goes — URL or email |

### Site Settings

| Field | Title | Description |
|---|---|---|
| heroHeadline | Main Headline | The big text at the top of your homepage |
| heroTagline | Tagline | The line right below your headline |
| heroSubtext | Subtext | The smaller text under your tagline |
| ctaText | Button Text | What your main call-to-action button says |
| ctaLink | Button Link | Where the button goes (email, Calendly, etc.) |

### Field groups

| Current | Renamed |
|---|---|
| Content | Content |
| Cards & Stats | Numbers & Cards |
| Settings | Page Settings |
| Hero | Your Headline |
| Contact | Contact Info |
| CTA | Call-to-Action Button |

## 5. Live Preview (Presentation Tool)

The centerpiece. Tareq explicitly requested this capability.

### What exists

- `presentationTool` configured in `sanity.config.ts`
- Location resolvers for section and siteSettings

### What's missing

- `/api/draft-mode/enable` — Next.js API route, enables draft mode + redirects (~15 lines)
- `/api/draft-mode/disable` — Exit preview mode (~5 lines)

### Experience

Split pane: document editor on left, live site iframe on right. Edit a headline, see it update in real time. No additional packages needed.

## 6. Scope Fence

### Explicitly out

| Feature | Reason |
|---|---|
| Publish & Deploy button | Vercel auto-deploys on publish already |
| Content analytics widgets | 3 schemas, ~10 docs — stats would be noise |
| Onboarding tooltips | UI should be obvious without them |
| Custom rich text toolbar | Current setup is already lean |
| Role-based access | Single user |
| Custom document actions | Standard Publish/Unpublish is clear |
| Studio CSS overrides | Theme + @sanity/ui only, no raw CSS |

### Future candidates (if Tareq asks)

- Deploy trigger button
- Section drag-and-drop reorder
- Content scheduling

## Design Standards Applied

Per `designs/CLAUDE.md` (Universal Design Constitution):

- **Clarity first** — navigation by intent, not schema type
- **Restraint** — removed slug field, minimal dashboard, no feature bloat
- **Honest design** — no fake depth, status badges use color + icon
- **Semantic tokens** — brand theme via Sanity's token system, no hardcoded colors
- **Plain English copy** — verb + noun labels, sentence case, no jargon
- **Dark mode** — brand color at low lightness, warm gold accent, 85-90% white text
