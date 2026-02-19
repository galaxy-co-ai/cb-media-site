# CB Media Site — CLAUDE.md

## Quick Start

```bash
pnpm dev              # Dev server → http://localhost:3007
pnpm build            # Production build
pnpm test             # Vitest (watch mode)
pnpm test:run         # Vitest (single run)
pnpm lint             # ESLint
```

## Project Overview

| Key | Value |
|-----|-------|
| **Type** | Marketing agency website (single page, dark theme) |
| **Stack** | Next.js 16, React 19, Tailwind v4, Framer Motion 12 |
| **CMS** | Sanity v5 (Studio at `/studio`) |
| **Chat/Sessions** | Upstash Redis (24h TTL) |
| **Email** | Resend + Telegram bot notifications |
| **Testing** | Vitest + React Testing Library |
| **Hosting** | Vercel (auto-deploy on push) |
| **Live** | https://cb-media-site.vercel.app |

## Architecture

```
page.tsx (server) → sanityFetch() → HomeClient (client)
                  ↘ fallbackSections (if Sanity unavailable)

HomeClient renders:
  InterstellarBackground (canvas starfield)
  Hero (scroll parallax, cursor gradient, chevron nav)
  Accordion (Framer Motion expand/collapse → PortableText, StatsGrid, ServiceGrid)
  Footer
```

## File Structure

```
src/
├── app/
│   ├── page.tsx              # SSR: fetches Sanity sections
│   ├── HomeClient.tsx        # Client: hero + accordion + footer
│   ├── layout.tsx            # Fonts (Inter, Space Grotesk, Montserrat)
│   ├── globals.css           # Dark theme, grain, vignette, typography
│   ├── error.tsx / loading.tsx / not-found.tsx
│   ├── studio/[[...tool]]/   # Sanity Studio route
│   └── api/
│       ├── chat/route.ts     # POST send / GET poll
│       └── feedback/route.ts # POST with screenshot → email + Telegram
├── components/
│   ├── sections/Accordion.tsx         # Framer Motion accordion
│   ├── InterstellarBackground.tsx     # Canvas starfield (ACTIVE background)
│   ├── GridSkylineBackground.tsx      # Canvas city skylines (UNUSED)
│   ├── GridZoomIntro.tsx              # Zoom intro (UNUSED)
│   ├── content/
│   │   ├── PortableTextRenderer.tsx   # Sanity rich text
│   │   ├── StatsGrid.tsx             # Animated counter grid
│   │   └── ServiceGrid.tsx           # Service cards with CTAs
│   └── feedback/FeedbackWidget.tsx    # Floating feedback modal
├── sanity/
│   ├── schemas/   # section, siteSettings, stat
│   ├── lib/       # client, queries, types, image
│   └── env.ts     # isSanityConfigured flag
├── lib/
│   ├── fallback-content.ts   # 5 hardcoded sections (Sanity fallback)
│   ├── redis.ts              # Upstash Redis chat sessions
│   └── utils.ts              # cn() helper
└── test/setup.ts             # Vitest + jest-dom setup

scripts/
├── seed-sanity.ts            # Seed initial Sanity content
└── update-service-items.ts   # Service item utility
```

## Environment

Required `.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=ctm1hbbr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

Optional (chat/feedback features):
```bash
RESEND_API_KEY=               # Feedback emails
TELEGRAM_BOT_TOKEN=           # Telegram notifications
TELEGRAM_CHAT_ID=             # Telegram destination
UPSTASH_REDIS_REST_URL=       # Chat session storage
UPSTASH_REDIS_REST_TOKEN=     # Upstash auth
```

For seeding Sanity content:
```bash
SANITY_API_WRITE_TOKEN=xxx pnpm exec tsx scripts/seed-sanity.ts
```

## Typography

| Element | Font | Weight | Tracking |
|---------|------|--------|----------|
| Hero / Display | Montserrat | 600 | 8% |
| Accordion / UI | Space Grotesk | 300–700 | 8% |
| Body | Inter | 400 | default |

## Gotchas

- Dev server runs on port **3007**, not 3000
- Sanity Studio is embedded at `/studio` — needs CORS configured for localhost + vercel.app
- **InterstellarBackground** is the active background; GridSkylineBackground and GridZoomIntro are unused legacy
- `gsap` and `lenis` are installed but not actively used — Framer Motion is the animation library
- Sanity content falls back to `lib/fallback-content.ts` when unconfigured — the site works without CMS
- Chat webhook route (`api/chat/webhook`) is a stub — not fully implemented
- `public/` still has default Next.js SVGs (file.svg, globe.svg, etc.) — safe to replace
