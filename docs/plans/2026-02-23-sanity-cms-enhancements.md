# Sanity CMS Enhancements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade CB Media's Sanity CMS from basic iframe preview to full Presentation Tool with visual editing, on-demand revalidation, CLI tooling, and SEO scoring.

**Architecture:** Replace the DIY IframePreview with Sanity's official Presentation Tool, which communicates directly with the Next.js app via draft mode. Add a revalidation webhook so published changes appear instantly. Wire up `sanity.cli.ts` for CLI operations and type generation.

**Tech Stack:** Sanity v5, next-sanity v12, Next.js 16, Presentation Tool, Visual Editing, GROQ webhooks

---

## Current State (What's Already Done)

These are already in place — do NOT re-implement:
- `layout.tsx` renders `<SanityLive />` and `{draft.isEnabled && <VisualEditing />}`
- `live.ts` exports `defineLive` with `serverToken` / `browserToken`
- `client.ts` has stega enabled with `studioUrl: '/studio'`
- `sanity.config.ts` has custom theme, structure builder, IframePreview view pane
- `@sanity/assist`, `sanity-plugin-media`, `@sanity/orderable-document-list`, `@sanity/vision` installed

## Environment Variables Needed

Before starting, these must exist in `.env.local`:
```bash
# Already set:
NEXT_PUBLIC_SANITY_PROJECT_ID=ctm1hbbr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# NEW — required for Tasks 2-4:
SANITY_VIEWER_TOKEN=<viewer-role token from manage.sanity.io>
SANITY_REVALIDATE_SECRET=<random string, e.g. from `openssl rand -hex 32`>
```

---

### Task 1: Add `sanity.cli.ts`

**Files:**
- Create: `sanity.cli.ts`

**Step 1: Create the CLI config**

```ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ctm1hbbr',
    dataset: 'production',
  },
  studioHost: 'cb-media',
})
```

**Step 2: Verify CLI works**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm exec sanity --version`
Expected: Sanity CLI version output (no errors)

**Step 3: Commit**

```bash
git add sanity.cli.ts
git commit -m "chore: add sanity.cli.ts for CLI operations"
```

---

### Task 2: Add Presentation Tool to Studio

**Files:**
- Modify: `sanity.config.ts` (add `presentationTool` plugin, keep IframePreview as fallback view)

**Step 1: Add `presentationTool` import and plugin**

In `sanity.config.ts`, add to imports:
```ts
import { presentationTool } from 'sanity/presentation'
```

Add to the `plugins` array (after `structureTool`, before `visionTool`):
```ts
presentationTool({
  previewUrl: {
    draftMode: {
      enable: '/api/draft/enable',
    },
  },
}),
```

The full plugins array becomes:
```ts
plugins: [
  structureTool({ ... }),  // existing, unchanged
  presentationTool({
    previewUrl: {
      draftMode: {
        enable: '/api/draft/enable',
      },
    },
  }),
  visionTool({ defaultApiVersion: '2024-01-01' }),
  media(),
  assist(),
],
```

**Step 2: Verify Studio still loads**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm build`
Expected: Build succeeds. (The Presentation tool tab will appear in Studio but won't work yet — draft mode route doesn't exist until Task 3.)

**Step 3: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(studio): add Presentation Tool for live visual editing"
```

---

### Task 3: Add Draft Mode API Routes

**Files:**
- Create: `src/app/api/draft/enable/route.ts`
- Create: `src/app/api/draft/disable/route.ts`

**Step 1: Create the enable route**

`src/app/api/draft/enable/route.ts`:
```ts
import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({
    token: process.env.SANITY_VIEWER_TOKEN,
  }),
})
```

**Step 2: Create the disable route**

`src/app/api/draft/disable/route.ts`:
```ts
import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const draft = await draftMode()
  draft.disable()
  return NextResponse.json({ status: 'Draft mode disabled' })
}
```

**Step 3: Verify routes exist**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm build`
Expected: Build succeeds with new API routes compiled.

**Step 4: Commit**

```bash
git add src/app/api/draft/
git commit -m "feat: add draft mode enable/disable API routes for Presentation Tool"
```

---

### Task 4: Add On-Demand Revalidation Webhook

**Files:**
- Create: `src/app/api/revalidate/route.ts`

**Step 1: Create the revalidation endpoint**

`src/app/api/revalidate/route.ts`:
```ts
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{
      _type: string
    }>(req, process.env.SANITY_REVALIDATE_SECRET)

    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      )
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Bad request' },
        { status: 400 }
      )
    }

    // Map document types to cache tags
    const tagMap: Record<string, string[]> = {
      section: ['sections'],
      siteSettings: ['siteSettings'],
    }

    const tags = tagMap[body._type] || [body._type]
    for (const tag of tags) {
      revalidateTag(tag)
    }

    return NextResponse.json({
      status: 'ok',
      revalidated: tags,
      now: Date.now(),
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
```

**Step 2: Update `sanityFetch` to remove aggressive TTL**

In `src/sanity/lib/client.ts`, change the revalidation from 1-hour TTL to tag-only:
```ts
// BEFORE:
revalidate: process.env.NODE_ENV === 'development' ? 30 : 3600,

// AFTER:
revalidate: process.env.NODE_ENV === 'development' ? 30 : false,
```

Setting `revalidate: false` means production relies entirely on `revalidateTag()` from the webhook — published changes appear in seconds, not up to an hour.

**Step 3: Verify build**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/api/revalidate/ src/sanity/lib/client.ts
git commit -m "feat: add on-demand revalidation webhook — kill the 1-hour cache lag"
```

**Step 5: Configure Sanity webhook (manual — document for Vercel deploy)**

After deploying, create a GROQ webhook at `manage.sanity.io`:
- **Name:** `Revalidate Next.js`
- **URL:** `https://cb-media-site.vercel.app/api/revalidate`
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["section", "siteSettings"]`
- **Secret:** Same value as `SANITY_REVALIDATE_SECRET` env var
- **HTTP method:** POST

Also add `SANITY_REVALIDATE_SECRET` to Vercel env vars.

---

### Task 5: Add SEO Pane Plugin

**Files:**
- Modify: `package.json` (install plugin)
- Modify: `sanity.config.ts` (add SEO pane to document views)

**Step 1: Install the plugin**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm add sanity-plugin-seo-pane`

**Step 2: Add SEO pane to document views**

In `sanity.config.ts`, add import:
```ts
import { SeoPane } from 'sanity-plugin-seo-pane'
```

Update `defaultDocumentNode` to include SEO pane for `siteSettings`:
```ts
defaultDocumentNode: (S, { schemaType }) => {
  const views = [S.view.form()]

  if (schemaType === 'section' || schemaType === 'siteSettings') {
    views.push(S.view.component(IframePreview).title('Preview'))
  }

  if (schemaType === 'siteSettings') {
    views.push(
      S.view
        .component(SeoPane)
        .options({
          keywords: 'metaDescription',
          synonyms: 'metaTitle',
          url: (doc: Record<string, unknown>) =>
            process.env.NEXT_PUBLIC_SITE_URL ||
            'https://cb-media-site.vercel.app',
        })
        .title('SEO')
    )
  }

  return S.document().views(views)
},
```

**Step 3: Verify build**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml sanity.config.ts
git commit -m "feat(studio): add SEO pane for real-time SEO scoring on site settings"
```

---

### Task 6: Add Sanity Type Generation

**Files:**
- Modify: `package.json` (add typegen script)
- Create: `sanity-typegen.json` (typegen config — only if needed, may work without it)

**Step 1: Add typegen script to package.json**

Add to `"scripts"`:
```json
"typegen": "sanity typegen generate"
```

**Step 2: Run type generation**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm typegen`
Expected: Generates `sanity.types.ts` at project root with TypeScript types for all schemas and GROQ queries.

**Step 3: Verify generated types match handwritten ones**

Compare `sanity.types.ts` output with `src/sanity/lib/types.ts`. The generated types should be a superset. Do NOT replace the handwritten types yet — just verify they're compatible. We can migrate to generated types in a future task.

**Step 4: Commit**

```bash
git add package.json sanity.types.ts
git commit -m "chore: add Sanity type generation"
```

---

### Task 7: Verify Everything Works Together

**Step 1: Install dependencies**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm install`

**Step 2: Build**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm build`
Expected: Clean build, no errors.

**Step 3: Run existing tests**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm test:run`
Expected: All existing tests pass (PortableTextRenderer, utils).

**Step 4: Lint**

Run: `cd "C:/Users/Owner/workspace/cb-media-site" && pnpm lint`
Expected: No new lint errors.

**Step 5: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "chore: verify all Sanity CMS enhancements build and test clean"
```

---

## Post-Deploy Checklist

After merging and deploying to Vercel:

1. [ ] Add `SANITY_VIEWER_TOKEN` to Vercel env vars (viewer-role token from manage.sanity.io)
2. [ ] Add `SANITY_REVALIDATE_SECRET` to Vercel env vars
3. [ ] Create GROQ webhook at manage.sanity.io pointing to `/api/revalidate`
4. [ ] Add `https://cb-media-site.vercel.app` to Sanity CORS origins (with credentials)
5. [ ] Test Presentation Tool: open Studio → Presentation tab → verify live preview loads
6. [ ] Test revalidation: edit a section in Studio → publish → verify site updates within seconds
7. [ ] Test SEO pane: open Site Settings → SEO tab → verify scoring appears
