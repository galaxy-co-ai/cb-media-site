# CB Media Studio — Premium CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the default Sanity Studio into a branded, intuitive content hub that a non-technical client (Tareq) uses weekly to manage his website.

**Architecture:** All customization uses Sanity's built-in APIs — `buildLegacyTheme()` for theming, `structureTool()` for sidebar, `@sanity/ui` for components, `presentationTool()` for live preview. Draft mode uses `next-sanity/draft-mode` with Next.js 16's `draftMode()` API. No custom CSS, no external UI libraries.

**Tech Stack:** Sanity v5, next-sanity v12, Next.js 16, React 19, @sanity/ui v3, TypeScript

**Design doc:** `docs/plans/2026-02-23-cb-media-studio-design.md`

---

### Task 1: Brand Theme

**Files:**
- Modify: `sanity.config.ts:9-27` (theme object)

**Step 1: Update theme values**

Replace the existing `buildLegacyTheme()` call:

```typescript
const theme = buildLegacyTheme({
  '--black': '#0a0a0a',
  '--white': '#f0f0f0',
  '--gray-base': '#141414',
  '--gray': '#666666',
  '--component-bg': '#111111',
  '--component-text-color': '#e0e0e0',
  '--brand-primary': '#E8C872',
  '--default-button-color': '#E8C872',
  '--default-button-primary-color': '#E8C872',
  '--default-button-success-color': '#4ade80',
  '--default-button-warning-color': '#facc15',
  '--default-button-danger-color': '#f87171',
  '--state-info-color': '#60a5fa',
  '--state-success-color': '#4ade80',
  '--state-warning-color': '#facc15',
  '--state-danger-color': '#f87171',
  '--focus-color': '#E8C872',
  '--main-navigation-color': '#0a0a0a',
})
```

Key changes: `--brand-primary` → warm gold `#E8C872`, `--white` → softer `#f0f0f0`, `--component-text-color` → `#e0e0e0`, `--gray-base` → `#141414`.

**Step 2: Verify build**

Run: `pnpm build` from `C:/Users/Owner/workspace/cb-media-site`
Expected: Build succeeds (theme is config-only, no runtime impact)

**Step 3: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(studio): apply CB Media brand theme with warm gold accent"
```

---

### Task 2: Branded Navbar

**Files:**
- Modify: `src/sanity/components/StudioNavbar.tsx` (full rewrite)

**Step 1: Rewrite navbar with @sanity/ui components**

Replace the entire file:

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
          weight="semibold"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            letterSpacing: '0.12em',
          }}
        >
          <span style={{ color: '#E8C872' }}>CB</span>{' '}
          MEDIA
        </Text>
        <Text size={0} muted style={{ letterSpacing: '0.08em' }}>
          Studio
        </Text>
      </Flex>
      {props.renderDefault(props)}
    </Flex>
  )
}
```

Key changes: Uses `@sanity/ui` `Flex` and `Text` instead of raw divs/spans. "CB" in brand gold, "MEDIA" in default text, "Studio" muted. No inline colors except the gold accent on "CB" (theme doesn't control individual text spans).

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/sanity/components/StudioNavbar.tsx
git commit -m "feat(studio): branded navbar with CB gold wordmark"
```

---

### Task 3: Favicon

**Files:**
- Create: `public/favicon.svg` (CB monogram in gold)
- Modify: `src/app/layout.tsx` (add favicon meta if not already present)

**Step 1: Create SVG favicon**

Create `public/favicon.svg` — a simple "CB" lettermark in the brand gold `#E8C872` on transparent background. Text-based SVG, ~10 lines. Use Space Grotesk-style letterforms (geometric sans).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
  <text x="16" y="21" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#E8C872" letter-spacing="0.5">CB</text>
</svg>
```

**Step 2: Check layout.tsx for existing favicon reference**

Read `src/app/layout.tsx` and check if there's already a favicon link. If using Next.js metadata API, add icon to the metadata export. If not, add a `<link rel="icon">` tag.

**Step 3: Verify favicon loads**

Run dev server, navigate to `/studio`, confirm browser tab shows CB monogram instead of default Sanity icon.

**Step 4: Commit**

```bash
git add public/favicon.svg src/app/layout.tsx
git commit -m "feat(studio): CB Media gold favicon"
```

---

### Task 4: Schema Polish

**Files:**
- Modify: `src/sanity/schemas/section.ts:7-11` (groups), `src/sanity/schemas/section.ts:135-143` (slug field — hide from UI)
- Modify: `src/sanity/schemas/siteSettings.ts:7-11` (groups)

**Step 1: Update section schema groups**

```typescript
groups: [
  { name: 'content', title: 'Content', default: true },
  { name: 'cards', title: 'Numbers & Cards' },
  { name: 'settings', title: 'Page Settings' },
],
```

**Step 2: Hide slug field from Tareq**

Add `hidden: true` to the slug field definition at line 136:

```typescript
defineField({
  name: 'slug',
  title: 'Section ID',
  type: 'slug',
  group: 'settings',
  hidden: true,
  description: 'Auto-generated from the title.',
  options: { source: 'title', maxLength: 96 },
  validation: (Rule) => Rule.required(),
}),
```

**Step 3: Update siteSettings schema groups**

```typescript
groups: [
  { name: 'hero', title: 'Your Headline', default: true },
  { name: 'contact', title: 'Contact Info' },
  { name: 'cta', title: 'Call-to-Action Button' },
],
```

**Step 4: Verify build**

Run: `pnpm build`
Expected: Build succeeds. Slug field no longer visible in Studio form. Group tabs show new labels.

**Step 5: Commit**

```bash
git add src/sanity/schemas/section.ts src/sanity/schemas/siteSettings.ts
git commit -m "feat(studio): plain-English schema groups and hide slug field"
```

---

### Task 5: Sidebar Structure

**Files:**
- Modify: `sanity.config.ts:53-81` (structureTool config)

**Step 1: Replace structure builder**

Replace the existing `structureTool` plugin config:

```typescript
structureTool({
  structure: (S) =>
    S.list()
      .title('Your Website')
      .items([
        // Hero & Branding — singleton, opens directly to form
        S.listItem()
          .title('Hero & Branding')
          .id('siteSettings')
          .icon(() => '✏️')
          .child(
            S.document()
              .schemaType('siteSettings')
              .documentId('siteSettings')
              .title('Your headline, contact info, and call-to-action')
          ),

        S.divider(),

        // Homepage Sections — with sub-filters
        S.listItem()
          .title('Homepage Sections')
          .icon(() => '📄')
          .child(
            S.list()
              .title('Homepage Sections')
              .items([
                S.listItem()
                  .title('All Sections')
                  .icon(() => '📋')
                  .child(
                    S.documentTypeList('section')
                      .title('All Sections')
                      .defaultOrdering([{ field: 'order', direction: 'asc' }])
                  ),
                S.listItem()
                  .title('Visible on Site')
                  .icon(() => '🟢')
                  .child(
                    S.documentList()
                      .title('Visible on Site')
                      .filter('_type == "section" && isVisible == true')
                      .defaultOrdering([{ field: 'order', direction: 'asc' }])
                  ),
                S.listItem()
                  .title('Hidden')
                  .icon(() => '⚫')
                  .child(
                    S.documentList()
                      .title('Hidden Sections')
                      .filter('_type == "section" && isVisible != true')
                      .defaultOrdering([{ field: 'order', direction: 'asc' }])
                  ),
              ])
          ),
      ]),
}),
```

Note: The "Home" tool (dashboard) and "Visual Editor" (presentation tool) are already registered as separate tools in the config — they appear as top-level tabs automatically. The structure builder only governs the "Content" pane.

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Verify navigation manually**

Run dev server, navigate to `/studio`. Confirm:
- Sidebar shows "Your Website" as root title
- "Hero & Branding" opens directly to siteSettings form
- "Homepage Sections" expands to show All / Visible / Hidden sub-lists
- Section rows show `#{order}. Title` with visibility subtitle (already handled by schema preview)

**Step 4: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(studio): restructured sidebar with intent-based navigation"
```

---

### Task 6: Welcome Dashboard

**Files:**
- Modify: `src/sanity/components/StudioWelcome.tsx` (full rewrite)

**Step 1: Rewrite dashboard component**

Replace the entire file. The new component:
- Uses `@sanity/ui` components (Card, Stack, Text, Heading, Flex, Button, Grid, Badge)
- Fetches section count and last-edited timestamp via `useClient()` + GROQ
- Renders: branded header → status cards → quick actions list → getting started tips → view live site button
- Max-width 560px, centered vertically
- All navigation uses `router.navigateUrl()`

```tsx
import { useEffect, useState } from 'react'
import { Card, Stack, Text, Heading, Flex, Button, Grid, Badge, Box } from '@sanity/ui'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'

interface ContentStats {
  sectionCount: number
  lastEdited: string | null
}

function useContentStats() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [stats, setStats] = useState<ContentStats>({ sectionCount: 0, lastEdited: null })

  useEffect(() => {
    const query = `{
      "sectionCount": count(*[_type == "section" && !(_id in path("drafts.**"))]),
      "lastEdited": *[_type == "section"] | order(_updatedAt desc)[0]._updatedAt
    }`
    client.fetch(query).then((result: ContentStats) => setStats(result))
  }, [client])

  return stats
}

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

const QUICK_ACTIONS = [
  {
    icon: '📄',
    title: 'Edit Homepage Sections',
    description: 'Update what visitors see on your website',
    path: '/studio/structure/section',
  },
  {
    icon: '✏️',
    title: 'Update Hero & Contact Info',
    description: 'Change your headline, email, or call-to-action',
    path: '/studio/structure/siteSettings',
  },
  {
    icon: '👁',
    title: 'Open Visual Editor',
    description: 'See your changes in real-time as you type',
    path: '/studio/presentation',
  },
]

export function StudioWelcome() {
  const router = useRouter()
  const stats = useContentStats()

  return (
    <Flex align="center" justify="center" style={{ height: '100%', padding: '2rem' }}>
      <Stack space={5} style={{ maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <Stack space={3}>
          <Heading
            size={4}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ color: '#E8C872' }}>CB MEDIA</span>{' '}
            Content Studio
          </Heading>
          <Text size={2} muted>
            Welcome back. Here&apos;s where things stand.
          </Text>
        </Stack>

        {/* Status Cards */}
        <Grid columns={2} gap={3}>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={1} muted>Sections published</Text>
              <Heading size={3}>{stats.sectionCount}</Heading>
            </Stack>
          </Card>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={1} muted>Last edited</Text>
              <Heading size={3}>{formatTimeAgo(stats.lastEdited)}</Heading>
            </Stack>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Stack space={2}>
          <Text size={1} weight="semibold" style={{ letterSpacing: '0.06em' }}>
            QUICK ACTIONS
          </Text>
          <Card radius={2} border overflow="hidden">
            <Stack>
              {QUICK_ACTIONS.map((action, i) => (
                <Card
                  key={action.path}
                  padding={4}
                  tone="default"
                  style={{
                    cursor: 'pointer',
                    borderTop: i > 0 ? '1px solid var(--card-border-color)' : undefined,
                  }}
                  onClick={() => router.navigateUrl({ path: action.path })}
                >
                  <Flex align="center" gap={3}>
                    <Text size={2}>{action.icon}</Text>
                    <Stack space={1} style={{ flex: 1 }}>
                      <Text size={1} weight="semibold">{action.title}</Text>
                      <Text size={1} muted>{action.description}</Text>
                    </Stack>
                    <Text size={1} muted>→</Text>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Card>
        </Stack>

        {/* Getting Started */}
        <Card padding={4} radius={2} border tone="default">
          <Stack space={3}>
            <Text size={1} weight="semibold">Getting Started</Text>
            <Stack space={2}>
              <Text size={1} muted>• Click any section in the sidebar to edit it</Text>
              <Text size={1} muted>• Hit &quot;Publish&quot; to push changes live</Text>
              <Text size={1} muted>• Use the Visual Editor to preview as you type</Text>
              <Text size={1} muted>• Toggle &quot;Show on Website&quot; to hide a section without deleting</Text>
            </Stack>
          </Stack>
        </Card>

        {/* View Live Site */}
        <Flex justify="center">
          <Button
            as="a"
            href={process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-media-site.vercel.app'}
            target="_blank"
            rel="noopener noreferrer"
            text="View Live Site ↗"
            tone="primary"
            mode="ghost"
            style={{ letterSpacing: '0.06em' }}
          />
        </Flex>
      </Stack>
    </Flex>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/sanity/components/StudioWelcome.tsx
git commit -m "feat(studio): branded welcome dashboard with status cards and quick actions"
```

---

### Task 7: Draft Mode API Routes (Live Preview)

**Files:**
- Create: `src/app/api/draft-mode/enable/route.ts`
- Create: `src/app/api/draft-mode/disable/route.ts`
- Modify: `src/app/layout.tsx` (add VisualEditing + SanityLive)
- Create: `src/sanity/lib/live.ts` (defineLive setup)

This is the centerpiece — the feature Tareq explicitly requested.

**Step 1: Create the `defineLive` setup**

Create `src/sanity/lib/live.ts`:

```typescript
import { defineLive } from 'next-sanity'
import { client } from './client'

const token = process.env.SANITY_VIEWER_TOKEN

export const { sanityFetch: sanityFetchLive, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
```

**Step 2: Create draft-mode enable route**

Create `src/app/api/draft-mode/enable/route.ts`:

```typescript
import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({
    token: process.env.SANITY_VIEWER_TOKEN,
  }),
})
```

**Step 3: Create draft-mode disable route**

Create `src/app/api/draft-mode/disable/route.ts`:

```typescript
import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'))
}
```

**Step 4: Add VisualEditing and SanityLive to layout**

Read `src/app/layout.tsx` first. Then add to the body:

```tsx
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { SanityLive } from '@/sanity/lib/live'
```

Inside the body, after `{children}`:

```tsx
<SanityLive />
{(await draftMode()).isEnabled && <VisualEditing />}
```

Note: The layout must be `async` if it isn't already: `export default async function RootLayout(...)`.

**Step 5: Add SANITY_VIEWER_TOKEN to env**

This requires generating a viewer token from the Sanity dashboard (manage.sanity.io → project → API → Tokens → Add token with "Viewer" role).

Add to `.env.local`:
```
SANITY_VIEWER_TOKEN=sk...
```

Add to Vercel:
```bash
vercel env add SANITY_VIEWER_TOKEN production
```

**Step 6: Verify build**

Run: `pnpm build`
Expected: Build succeeds (token may not be set yet locally, but the routes should compile)

**Step 7: Commit**

```bash
git add src/app/api/draft-mode/ src/sanity/lib/live.ts src/app/layout.tsx
git commit -m "feat(studio): wire up draft mode for live visual editing"
```

---

### Task 8: Manual Integration Test

**No code changes.** Verify the full flow works end-to-end.

**Step 1: Start dev server**

Run: `pnpm dev` from cb-media-site

**Step 2: Navigate to Studio**

Open `http://localhost:3007/studio`

**Verify checklist:**
- [ ] Browser tab shows CB favicon (not default Sanity icon)
- [ ] Navbar shows "CB MEDIA Studio" with gold "CB"
- [ ] Dashboard (Home tab) shows branded header, status cards, quick actions
- [ ] Status cards show correct section count and last-edited time
- [ ] Quick action "Edit Homepage Sections" navigates to section list
- [ ] Quick action "Update Hero & Contact Info" opens siteSettings form
- [ ] Sidebar shows "Your Website" root with "Hero & Branding" and "Homepage Sections"
- [ ] "Homepage Sections" expands to All / Visible / Hidden sub-lists
- [ ] Section document form shows "Content", "Numbers & Cards", "Page Settings" tabs
- [ ] Slug field is not visible
- [ ] Site Settings form shows "Your Headline", "Contact Info", "Call-to-Action Button" tabs
- [ ] Visual Editor (Presentation tool) loads the site in an iframe
- [ ] Editing a field in Visual Editor mode updates the preview in real-time

**Step 3: Fix any issues found**

Address bugs discovered during testing.

**Step 4: Final commit if fixes were needed**

```bash
git commit -m "fix(studio): address integration test findings"
```

---

## Task Dependency Graph

```
Task 1 (Theme) ──────────────────┐
Task 2 (Navbar) ─────────────────┤
Task 3 (Favicon) ────────────────┤
Task 4 (Schema Polish) ──────────┼── all independent, can parallelize
Task 5 (Sidebar Structure) ──────┤
Task 6 (Welcome Dashboard) ──────┤
Task 7 (Draft Mode Routes) ──────┘
                                  │
                                  ▼
                    Task 8 (Integration Test) ── depends on all above
```

Tasks 1-7 are fully independent and can be executed in any order or in parallel. Task 8 validates the complete integration.

## Environment Requirements

| Variable | Source | Required For |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Already set | Everything |
| `NEXT_PUBLIC_SANITY_DATASET` | Already set | Everything |
| `SANITY_VIEWER_TOKEN` | Generate at manage.sanity.io | Task 7 (live preview) |

## Files Changed Summary

| Action | File |
|---|---|
| Modify | `sanity.config.ts` (theme + structure) |
| Modify | `src/sanity/components/StudioNavbar.tsx` |
| Modify | `src/sanity/components/StudioWelcome.tsx` |
| Modify | `src/sanity/schemas/section.ts` |
| Modify | `src/sanity/schemas/siteSettings.ts` |
| Modify | `src/app/layout.tsx` |
| Create | `public/favicon.svg` |
| Create | `src/app/api/draft-mode/enable/route.ts` |
| Create | `src/app/api/draft-mode/disable/route.ts` |
| Create | `src/sanity/lib/live.ts` |
