# CB Media Site — INDEX

> Marketing agency website for CB Media. Single-page dark theme with animated hero, accordion content sections, and Sanity CMS.

## Routes

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` → `app/HomeClient.tsx` | Page (SSR → Client) | Hero + accordion. Server fetches Sanity, client renders |
| `/studio` | `app/studio/[[...tool]]/page.tsx` | Page (Client) | Embedded Sanity Studio CMS |
| `/api/chat` | `app/api/chat/route.ts` | API (GET, POST) | Chat: POST sends message, GET polls for new |
| `/api/chat/webhook` | `app/api/chat/webhook/route.ts` | API (POST) | Telegram webhook receiver (stub) |
| `/api/feedback` | `app/api/feedback/route.ts` | API (POST) | Feedback with screenshot → Resend email + Telegram |

### Special Next.js Files

- `app/error.tsx` — Error boundary
- `app/loading.tsx` — Loading skeleton
- `app/not-found.tsx` — 404 page
- `app/layout.tsx` — Root layout (fonts: Inter, Space Grotesk, Montserrat)
- `app/globals.css` — Dark theme, typography utils, film grain, vignette

## Components

### Page-Level

| Component | File | Props | What It Does |
|-----------|------|-------|--------------|
| `HomeClient` | `app/HomeClient.tsx` | `sections: Section[]` | Full page: hero with scroll parallax, cursor gradient, chevron nav, accordion, footer |
| `Accordion` | `components/sections/Accordion.tsx` | `sections: Section[]` | Expandable section list with Framer Motion spring animations, staggered content reveal |

### Content Renderers

| Component | File | Props | What It Does |
|-----------|------|-------|--------------|
| `PortableTextRenderer` | `components/content/PortableTextRenderer.tsx` | `content: PortableTextBlock[]` | Renders Sanity rich text (h3, h4, lists, bold, italic) |
| `StatsGrid` | `components/content/StatsGrid.tsx` | `stats: Stat[]` | 4-column animated counter grid, triggers on scroll into view |
| `ServiceGrid` | `components/content/ServiceGrid.tsx` | `items: ServiceItem[]` | Vertical service card list with CTA buttons |

### Backgrounds

| Component | File | Rendering | What It Does |
|-----------|------|-----------|--------------|
| `InterstellarBackground` | `components/InterstellarBackground.tsx` | Canvas | **Active.** Starfield with parallax, nebulae, twinkling, shooting stars, cursor proximity glow |
| `GridSkylineBackground` | `components/GridSkylineBackground.tsx` | Canvas | **Unused.** City skyline morphing (NYC, Chicago, Miami, London, Dubai) |
| `GridZoomIntro` | `components/GridZoomIntro.tsx` | Framer Motion | **Unused.** Zoom-through grid intro sequence |

### Feedback

| Component | File | What It Does |
|-----------|------|--------------|
| `FeedbackWidget` | `components/feedback/FeedbackWidget.tsx` | Top-right floating modal: element selector, notes, screenshot capture (html2canvas), sends to `/api/feedback` |

### Data

- `components/skylineData.ts` — Building geometry definitions for 5 cities (used by GridSkylineBackground)

## Sanity CMS

### Schemas (`src/sanity/schemas/`)

| Schema | Type | Key Fields | Purpose |
|--------|------|------------|---------|
| `section` | Document | `title`, `slug`, `order`, `content` (PortableText), `stats[]`, `serviceItems[]`, `isVisible` | Accordion content sections |
| `siteSettings` | Singleton | `heroHeadline`, `heroTagline`, `heroSubtext`, `contactEmail`, `contactPhone`, `ctaText`, `ctaLink` | Global site config |
| `stat` | Object | `value`, `label` | Embedded in sections for StatsGrid |

### Sanity Lib (`src/sanity/lib/`)

- `client.ts` — `sanityFetch()` helper with tag-based revalidation
- `queries.ts` — `SECTIONS_QUERY` (visible sections, ordered), `SITE_SETTINGS_QUERY`
- `types.ts` — `Section`, `Stat`, `ServiceItem`, `SiteSettings` interfaces
- `image.ts` — Sanity image URL builder

### Data Flow

```
page.tsx (server) → sanityFetch(SECTIONS_QUERY) → HomeClient (client)
                  ↘ fallbackSections (if Sanity unconfigured/fails)
```

## Lib (`src/lib/`)

| File | Exports | Purpose |
|------|---------|---------|
| `fallback-content.ts` | `fallbackSections[]` | 5 hardcoded sections used when Sanity is down or unconfigured |
| `redis.ts` | `getSession`, `addMessage`, `mapTelegramToSession` | Upstash Redis chat session storage (24h TTL) |
| `utils.ts` | `cn()` | Class name merger (clsx + tailwind-merge) |

## Scripts (`scripts/`)

| Script | Command | Purpose |
|--------|---------|---------|
| `seed-sanity.ts` | `SANITY_API_WRITE_TOKEN=xxx pnpm exec tsx scripts/seed-sanity.ts` | Seeds Sanity with initial 5 sections + site settings |
| `update-service-items.ts` | `pnpm exec tsx scripts/update-service-items.ts` | Utility for managing service items |

## Tests (`src/`)

| File | Covers |
|------|--------|
| `components/content/PortableTextRenderer.test.tsx` | Empty content, h3/h4 headings, paragraphs |
| `lib/utils.test.ts` | `cn()` class merging and Tailwind conflict resolution |
| `test/setup.ts` | Testing library setup (jest-dom/vitest) |

## Config

| File | Key Settings |
|------|-------------|
| `next.config.ts` | Minimal (no custom config) |
| `sanity.config.ts` | basePath `/studio`, structure tool (Settings singleton + Sections list), vision tool |
| `tsconfig.json` | Strict, `@/*` → `src/*` |
| `vitest.config.ts` | jsdom env, `@/` alias, setup file |
| `postcss.config.mjs` | Tailwind v4 |
| `eslint.config.mjs` | Next.js defaults |

## Typography

| Element | Font | Weight | Tracking |
|---------|------|--------|----------|
| Hero / Display | Montserrat | 600 | 8% |
| Accordion / UI | Space Grotesk | 300–700 | 8% |
| Body | Inter | 400 | default |

## Visual Effects

- **Film grain** — SVG fractalNoise filter at low opacity
- **Vignette** — Radial gradient fade overlay
- **Cursor gradient** — Radial gradient follows mouse in hero (spring-smoothed)
- **Scroll parallax** — Hero scales/fades/blurs as user scrolls down
- **Snap scrolling** — `snap-mandatory` between hero and accordion sections
