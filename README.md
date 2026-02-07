# CB Media Site

Modern marketing agency website built with Next.js 16, featuring animated city skyline backgrounds and accordion-style content sections.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **React:** 19.2.3
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **CMS:** Sanity v5
- **Hosting:** Vercel

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3007](http://localhost:3007) to view the site.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Server component, fetches Sanity data
│   ├── HomeClient.tsx        # Client component with hero + accordion
│   ├── layout.tsx            # Fonts + global providers
│   ├── globals.css           # Dark theme, typography utilities
│   ├── studio/[[...tool]]/   # Sanity Studio route
│   └── api/
│       ├── chat/             # Telegram chat integration
│       └── feedback/         # User feedback endpoint
├── components/
│   ├── sections/Accordion.tsx      # Framer Motion expand/collapse
│   ├── GridSkylineBackground.tsx   # Animated city skyline
│   ├── content/                    # PortableText, ServiceGrid, StatsGrid
│   └── feedback/FeedbackWidget.tsx # Feedback collection
├── sanity/
│   ├── schemas/              # section, siteSettings, stat
│   └── lib/                  # client, queries, types
└── lib/
    ├── redis.ts              # Upstash Redis for chat sessions
    └── fallback-content.ts   # Static content fallback
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=ctm1hbbr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Optional: For Telegram chat integration
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# Optional: For Redis session storage
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

## Content Management

Content can be managed in two ways:

1. **Sanity Studio** - Visit `/studio` to edit content via CMS
2. **Fallback Content** - Edit `src/lib/fallback-content.ts` for static content

## Scripts

```bash
pnpm dev          # Start dev server on port 3007
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests with Vitest
```

## Deployment

The site deploys automatically to Vercel on push to `main`.

**Live URL:** https://cb-media-site.vercel.app
