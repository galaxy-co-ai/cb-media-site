# CB Media Site — CLAUDE.md

## Quick Start

```bash
pnpm dev              # Dev server (http://localhost:3007)
pnpm build            # Production build
pnpm test             # Run Vitest
pnpm lint             # ESLint
```

## Project Overview

| Key | Value |
|-----|-------|
| **Type** | Marketing agency website |
| **Stack** | Next.js 16, React 19, Tailwind v4, Framer Motion |
| **CMS** | Sanity v5 (Studio at `/studio`) |
| **Cache** | Upstash Redis |
| **Email** | Resend + Telegram bot |
| **Testing** | Vitest + React Testing Library |
| **Hosting** | Vercel |
| **Live** | https://cb-media-site.vercel.app |

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Home (server component, fetches Sanity)
│   ├── HomeClient.tsx        # Hero + accordion (client component)
│   ├── layout.tsx            # Fonts + providers
│   ├── globals.css           # Dark theme + typography
│   ├── studio/[[...tool]]/   # Sanity Studio route
│   └── api/                  # Chat, feedback endpoints
├── components/
│   ├── sections/Accordion.tsx      # Animated accordion sections
│   ├── GridSkylineBackground.tsx   # City skyline animation
│   ├── content/                    # PortableText, grids
│   └── feedback/FeedbackWidget.tsx
├── sanity/                   # CMS config & schemas
└── lib/                      # Utilities (Redis, fallback content)
```

## Key Patterns

- Server component fetches Sanity data, passes to client HomeClient
- Animated city skyline background with grid effect
- Accordion-style content sections with Framer Motion
- Sanity provides CMS content with fallback data in lib/

## Environment

Required `.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Gotchas

- Dev server runs on port **3007**, not 3000
- Sanity Studio is embedded at `/studio` route
- GSAP is legacy — new animations use Framer Motion
- HANDOFF.md in root has recent session notes
