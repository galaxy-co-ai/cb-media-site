# CB Media Site - Session Handoff

**Date:** 2026-02-06
**Project:** `C:\Users\Owner\workspace\cb-media-site`
**Live URL:** https://cb-media-site.vercel.app

---

## What We Built This Session

### 1. Framer Motion Accordion Animations
- Replaced GSAP with Framer Motion for smoother expand/collapse
- AnimatePresence handles enter/exit states
- Smooth easing curve `[0.4, 0, 0.2, 1]`

### 2. Sanity CMS - Fully Wired
- **Project ID:** `ctm1hbbr`
- **Studio URL:** `/studio` (login required)
- **Content seeded:** 5 sections + site settings
- **Seed script:** `scripts/seed-sanity.ts`
- **CORS configured:** localhost + vercel.app
- Queries/types fixed to match schema

### 3. Typography System
| Element | Font | Weight | Tracking |
|---------|------|--------|----------|
| Hero title | Montserrat | 600 | 8% |
| Display text | Space Grotesk | 300-700 | 8% |
| Body | Inter | - | default |

### 4. Navigation Chevrons
- **Down chevron** in hero → scrolls to accordion section
- **Up chevron** at top of accordion → scrolls back to hero
- Both use Framer Motion animations

### 5. Branding Updates
- Hero title: "CB MEDIA" (no dot)
- Footer: "CB MEDIA"

---

## Key Files

```
src/
├── app/
│   ├── layout.tsx          # Fonts + global providers
│   ├── HomeClient.tsx      # Hero + chevrons + accordion
│   ├── globals.css         # Typography utilities
│   └── studio/[[...tool]]/ # Sanity Studio route
├── components/
│   ├── sections/Accordion.tsx    # Framer Motion accordion
│   ├── feedback/FeedbackWidget.tsx
│   └── content/
│       ├── PortableTextRenderer.tsx
│       └── StatsGrid.tsx
├── sanity/
│   ├── schemas/            # section, siteSettings, stat
│   ├── lib/
│   │   ├── client.ts       # sanityFetch helper
│   │   ├── queries.ts      # GROQ queries
│   │   └── types.ts        # TypeScript interfaces
│   └── env.ts              # isSanityConfigured flag
└── lib/
    └── fallback-content.ts # Fallback when Sanity not configured

sanity.config.ts            # Studio config with basePath
scripts/seed-sanity.ts      # Content seeding script
```

---

## Environment Variables

### Local (`.env.local`)
```
NEXT_PUBLIC_SANITY_PROJECT_ID=ctm1hbbr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### Vercel
All Sanity env vars already configured.

---

## Git Status
- **Branch:** main
- **Latest commit:** `f2833c0` - feat(nav): add upward chevron
- **All changes pushed:** ✅

---

## Pending / Next Steps

1. **Test Sanity Studio** - Click "Structure" tab, should show Site Settings + Sections
2. **Typography refinements** - If client wants different sizes/weights
3. **Content updates** - Edit via Studio or update fallback-content.ts

---

## Commands

```bash
cd C:\Users\Owner\workspace\cb-media-site

# Dev server
pnpm dev

# Build
pnpm build

# Seed Sanity content (needs write token)
SANITY_API_WRITE_TOKEN=xxx pnpm exec tsx scripts/seed-sanity.ts
```

---

## Client Workflow (for your client)

1. Go to https://cb-media-site.vercel.app/studio
2. Log in with Google/GitHub
3. Edit Site Settings or Sections
4. Click Publish → Live within 1 hour
