# Studio Dark Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Sanity Studio from cream/white to a dark, branded, premium CMS that matches CB Media's cinematic identity.

**Architecture:** 4 files changed, 0 files created. Flip the `buildLegacyTheme` to dark tokens, rewrite `StudioWelcome.tsx` with proper hierarchy and dark cards, polish `StudioNavbar.tsx`, and overhaul `studio.css` for dark surfaces/selection/scrollbars. No schema or plugin changes.

**Tech Stack:** Sanity v5, `@sanity/ui`, `buildLegacyTheme`, React, CSS

**Design doc:** `docs/plans/2026-02-23-studio-dark-overhaul-design.md`

**Brand tokens (reference):**
```
Background:   #111010  (near-black)
Surface:      #1A1918  (card/elevated)
Elevated:     #161514  (gray-base)
Text:         #E8E4DE  (warm near-white)
Muted:        #6B6560  (secondary text)
Gold:         #E8C872  (accent/brand)
Gold dark:    #b8952e  (gold variant)
Border:       rgba(255,255,255,0.08)
```

---

### Task 1: Dark Theme Foundation

**Files:**
- Modify: `sanity.config.ts:14-33` (buildLegacyTheme block)

**Step 1: Update the theme object**

Replace the entire `buildLegacyTheme` call:

```ts
const theme = buildLegacyTheme({
  '--black': '#E8E4DE',
  '--white': '#111010',
  '--gray-base': '#161514',
  '--gray': '#6B6560',
  '--component-bg': '#1A1918',
  '--component-text-color': '#E8E4DE',
  '--brand-primary': '#E8C872',
  '--default-button-color': '#E8C872',
  '--default-button-primary-color': '#E8C872',
  '--default-button-success-color': '#3d9a50',
  '--default-button-warning-color': '#c9960c',
  '--default-button-danger-color': '#c53030',
  '--state-info-color': '#3b82b8',
  '--state-success-color': '#3d9a50',
  '--state-warning-color': '#c9960c',
  '--state-danger-color': '#c53030',
  '--focus-color': '#E8C872',
  '--main-navigation-color': '#111010',
})
```

**Step 2: Also update the home tool icon from emoji to a cleaner approach**

In the same file, replace the home tool icon:

```ts
{
  name: 'home',
  title: 'Home',
  icon: () => '◆',
  component: StudioWelcome,
},
```

**Step 3: Replace emoji icons in structure tool**

Replace all emoji icon callbacks in the structure definition:
- `'✏️'` → `'◆'` (Hero & Branding)
- `'📄'` → `'▤'` (Homepage Sections)
- `'📋'` → `'≡'` (All Sections)
- `'🟢'` → `'●'` (Visible on Site)
- `'⚫'` → `'○'` (Hidden)

**Step 4: Verify dev server loads with dark theme**

Run: `pnpm dev` and navigate to `http://localhost:3007/studio`
Expected: Dark background, light text, gold accents throughout

**Step 5: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(studio): dark theme foundation — flip buildLegacyTheme to dark palette"
```

---

### Task 2: Studio CSS Overhaul

**Files:**
- Modify: `src/sanity/studio.css` (full rewrite)

**Step 1: Replace studio.css with dark-mode styles**

```css
/* Space Grotesk for studio UI */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

/* ── Dark surfaces ── */
[data-ui='ToolScreen'],
[data-ui='Pane'] > [data-ui='PaneContent'] {
  background-color: #111010;
}

/* ── Gold accent on active nav tab ── */
[data-ui='Tab'][data-selected] {
  border-bottom-color: #E8C872 !important;
}

/* ── Gold accent on active sidebar item ── */
[data-ui='TreeItem'][data-selected] > [data-ui='Flex'] {
  border-left: 2px solid #E8C872;
}

/* ── Sidebar hover ── */
[data-ui='TreeItem']:hover > [data-ui='Flex'] {
  background-color: rgba(232, 200, 114, 0.06);
}

/* ── Tab bar ── */
[data-ui='TabList'] {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

[data-ui='TabList'] [data-ui='Tab'] {
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.03em;
  font-weight: 500;
}

/* ── Form input focus ring ── */
[data-ui='TextInput']:focus-within,
[data-ui='TextArea']:focus-within {
  --card-focus-ring-color: #E8C872;
}

/* ── Selection color ── */
::selection {
  background: rgba(232, 200, 114, 0.3);
  color: #E8E4DE;
}

/* ── Scrollbar (webkit) ── */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #111010;
}

::-webkit-scrollbar-thumb {
  background: #2A2827;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3A3837;
}

/* ── Navbar bottom border ── */
[data-ui='Navbar'] {
  border-bottom: 1px solid rgba(232, 200, 114, 0.15) !important;
}
```

**Step 2: Verify in dev server**

Check: sidebar hover states, active tab gold, scrollbars, selection color, input focus rings.

**Step 3: Commit**

```bash
git add src/sanity/studio.css
git commit -m "feat(studio): dark CSS overhaul — surfaces, scrollbars, selection, gold accents"
```

---

### Task 3: Navbar Polish

**Files:**
- Modify: `src/sanity/components/StudioNavbar.tsx` (full rewrite)

**Step 1: Rewrite StudioNavbar**

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
            fontFamily: '"Space Grotesk", sans-serif',
            letterSpacing: '0.14em',
          }}
        >
          <span style={{ color: '#E8C872' }}>CB</span>{' '}
          <span style={{ color: '#E8E4DE' }}>MEDIA</span>
        </Text>
        <Text
          size={0}
          style={{
            color: '#6B6560',
            letterSpacing: '0.08em',
            fontFamily: '"Space Grotesk", sans-serif',
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

Changes from current: explicit color tokens for dark bg, `weight="bold"` for crisper logo, explicit muted color on "Studio" tag.

**Step 2: Verify navbar renders on dark background with gold/white/muted treatment**

**Step 3: Commit**

```bash
git add src/sanity/components/StudioNavbar.tsx
git commit -m "feat(studio): polished navbar — explicit dark theme colors"
```

---

### Task 4: Welcome Dashboard Rebuild

**Files:**
- Modify: `src/sanity/components/StudioWelcome.tsx` (full rewrite)

This is the largest task. The current component is ~200 lines. The new one will be ~220 lines with better structure.

**Step 1: Rewrite StudioWelcome.tsx**

Key changes:
- Dark card surfaces with gold left-border accents
- SVG-style icons (Unicode geometric shapes) instead of emoji
- Quick actions as individual hoverable cards, not a stacked list
- Remove "Tip of the Day" entirely
- Add "Preview Site" as a subtle header link instead of a quick action
- `tabular-nums` on stat numbers
- Overline-style labels (uppercase, small, muted)
- Proper hover states on quick action cards
- Drafts warning with amber left-border instead of emoji

```tsx
import { useEffect, useState, useMemo } from 'react'
import { Card, Stack, Text, Heading, Flex, Grid, Box } from '@sanity/ui'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'

/* ── Tokens ── */
const GOLD = '#E8C872'
const GOLD_DIM = '#b8952e'
const TEXT = '#E8E4DE'
const MUTED = '#6B6560'
const SURFACE = '#1A1918'
const BORDER = 'rgba(255,255,255,0.08)'
const HOVER_BG = 'rgba(232,200,114,0.04)'

/* ── Types ── */
interface ContentStats {
  sectionCount: number
  hiddenCount: number
  draftCount: number
  lastEdited: string | null
}

/* ── Data hook ── */
function useContentStats() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [stats, setStats] = useState<ContentStats>({
    sectionCount: 0,
    hiddenCount: 0,
    draftCount: 0,
    lastEdited: null,
  })

  useEffect(() => {
    const query = `{
      "sectionCount": count(*[_type == "section" && !(_id in path("drafts.**"))]),
      "hiddenCount": count(*[_type == "section" && !(_id in path("drafts.**")) && isVisible != true]),
      "draftCount": count(*[_type == "section" && _id in path("drafts.**")]),
      "lastEdited": *[_type == "section"] | order(_updatedAt desc)[0]._updatedAt
    }`
    client.fetch(query).then((result: ContentStats) => setStats(result))
  }, [client])

  return stats
}

/* ── Helpers ── */
function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/* ── Quick Actions ── */
const QUICK_ACTIONS = [
  {
    icon: '◆',
    title: 'Edit homepage sections',
    description: 'Update what visitors see on your website',
    path: '/studio/structure/section',
  },
  {
    icon: '✦',
    title: 'Update hero & contact info',
    description: 'Change your headline, email, or call-to-action',
    path: '/studio/structure/siteSettings',
  },
]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-media-site.vercel.app'

/* ── Styles ── */
const cardStyle = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderLeft: `2px solid ${GOLD}`,
  borderRadius: 6,
}

const actionCardBase = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  cursor: 'pointer' as const,
  transition: 'background-color 150ms ease, transform 150ms ease',
}

/* ── Component ── */
export function StudioWelcome() {
  const router = useRouter()
  const stats = useContentStats()
  const [hoveredAction, setHoveredAction] = useState<number | null>(null)

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: '100%', padding: '2rem', backgroundColor: '#111010' }}
    >
      <Stack space={5} style={{ maxWidth: 580, width: '100%' }}>
        {/* ── Header ── */}
        <Stack space={3}>
          <Heading
            size={4}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: TEXT,
            }}
          >
            <span style={{ color: GOLD }}>CB MEDIA</span>{' '}
            Content Studio
          </Heading>
          <div style={{ width: 64, height: 2, backgroundColor: GOLD, borderRadius: 1 }} />
          <Flex align="center" justify="space-between">
            <Text size={1} style={{ color: MUTED }}>
              Your site at a glance
            </Text>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: MUTED,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: '"Space Grotesk", sans-serif',
                letterSpacing: '0.02em',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = GOLD }}
              onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
            >
              View live site ↗
            </a>
          </Flex>
        </Stack>

        {/* ── Stats ── */}
        <Grid columns={stats.draftCount > 0 ? 4 : 3} gap={3}>
          <div style={cardStyle}>
            <div style={{ padding: '16px 16px 16px 14px' }}>
              <Text
                size={0}
                style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
              >
                Published
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text
                  size={4}
                  weight="bold"
                  style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {stats.sectionCount}
                </Text>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ padding: '16px 16px 16px 14px' }}>
              <Text
                size={0}
                style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
              >
                Hidden
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text
                  size={4}
                  weight="bold"
                  style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {stats.hiddenCount}
                </Text>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ padding: '16px 16px 16px 14px' }}>
              <Text
                size={0}
                style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
              >
                Last edit
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text
                  size={4}
                  weight="bold"
                  style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif', fontSize: stats.lastEdited ? 18 : undefined }}
                >
                  {formatTimeAgo(stats.lastEdited)}
                </Text>
              </div>
            </div>
          </div>

          {stats.draftCount > 0 && (
            <div style={{ ...cardStyle, borderLeftColor: '#c9960c' }}>
              <div style={{ padding: '16px 16px 16px 14px' }}>
                <Text
                  size={0}
                  style={{ color: '#c9960c', letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
                >
                  Drafts
                </Text>
                <div style={{ marginTop: 6 }}>
                  <Text
                    size={4}
                    weight="bold"
                    style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {stats.draftCount}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Grid>

        {/* ── Draft warning ── */}
        {stats.draftCount > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(201,150,12,0.06)',
              border: '1px solid rgba(201,150,12,0.15)',
              borderLeft: '2px solid #c9960c',
              borderRadius: 6,
              padding: '12px 16px 12px 14px',
            }}
          >
            <Text size={1} style={{ color: '#c9960c' }}>
              {stats.draftCount} unpublished {stats.draftCount === 1 ? 'draft' : 'drafts'} — publish when ready
            </Text>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <Stack space={3}>
          <Text
            size={0}
            style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11, fontWeight: 600 }}
          >
            Quick actions
          </Text>
          <Stack space={2}>
            {QUICK_ACTIONS.map((action, i) => (
              <div
                key={action.title}
                role="button"
                tabIndex={0}
                style={{
                  ...actionCardBase,
                  backgroundColor: hoveredAction === i ? HOVER_BG : SURFACE,
                  transform: hoveredAction === i ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}
                onClick={() => {
                  if (action.path) {
                    router.navigateUrl({ path: action.path })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (action.path) router.navigateUrl({ path: action.path })
                  }
                }}
              >
                <Flex align="center" gap={3} style={{ padding: '16px' }}>
                  <Text size={2} style={{ color: GOLD, fontFamily: 'serif' }}>{action.icon}</Text>
                  <Stack space={1} style={{ flex: 1 }}>
                    <Text size={1} weight="semibold" style={{ color: TEXT }}>{action.title}</Text>
                    <Text size={1} style={{ color: MUTED }}>{action.description}</Text>
                  </Stack>
                  <Text size={1} style={{ color: MUTED }}>→</Text>
                </Flex>
              </div>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Flex>
  )
}
```

**Step 2: Verify the welcome dashboard in dev server**

Check:
- Dark background fills entire tool area
- Gold underline bar renders
- Stats cards have gold left-border
- "View live site" link hovers to gold
- Quick action cards hover with background shift + translateY
- Drafts card appears only when drafts exist
- No "Tip of the Day"
- No emoji anywhere

**Step 3: Commit**

```bash
git add src/sanity/components/StudioWelcome.tsx
git commit -m "feat(studio): rebuilt welcome dashboard — dark cards, proper hierarchy, no filler"
```

---

### Task 5: Visual Verification & Final Commit

**Step 1: Run full build to catch any TypeScript errors**

Run: `pnpm build`
Expected: Clean build, no type errors.

**Step 2: Manual visual check of all Studio views**

Navigate through:
1. Home tab (welcome dashboard)
2. Structure tab → sidebar, document list
3. Open a section document → form view, preview tab
4. Check gold focus rings on inputs
5. Check scrollbar styling
6. Check tab active states

**Step 3: Squash into a single feature commit (optional — user preference)**

If user prefers a single commit, otherwise the per-task commits are fine.

---

### Summary

| Task | File | What Changes |
|------|------|-------------|
| 1 | `sanity.config.ts` | Dark theme tokens, replace emoji icons |
| 2 | `src/sanity/studio.css` | Dark surfaces, scrollbars, selection, hover states |
| 3 | `src/sanity/components/StudioNavbar.tsx` | Explicit dark color tokens |
| 4 | `src/sanity/components/StudioWelcome.tsx` | Full rebuild — dark cards, hierarchy, no filler |
| 5 | — | Build verification, visual check |

**Total files modified: 4. Files created: 0.**
