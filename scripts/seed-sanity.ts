/**
 * Seed Sanity with initial content
 * Run with: pnpm exec tsx scripts/seed-sanity.ts
 */

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ctm1hbbr'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // Need write token for mutations
})

// Site Settings
const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  heroHeadline: 'CB.MEDIA',
  heroTagline: 'TURN VISIBILITY INTO VALUE',
  heroSubtext: 'Architects of culture, community, and impact. Engineering brands for long-term durability, not just short-term spikes.',
  contactEmail: 'tothman@CB.MEDIA',
  contactPhone: '+1 (919) 815-7727',
  ctaText: "LET'S TALK",
  ctaLink: 'mailto:tothman@CB.MEDIA',
}

// Sections
const sections = [
  {
    _id: 'what-we-do',
    _type: 'section',
    title: 'What We Do',
    slug: { _type: 'slug', current: 'what-we-do' },
    order: 1,
    isVisible: true,
    content: [
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: 'We architect cohesive brand and direct response campaigns that compound efficiency across every channel, from broadcast and streaming to digital and out-of-home.',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
    serviceItems: [
      {
        _key: 'service1',
        title: 'Media Efficiency & Coverage',
        description: 'We deploy budgets where they actually work. We address CAC creep and ROAS decline at the source, not the dashboard.',
        ctaText: 'EFFICIENCY AUDIT',
      },
      {
        _key: 'service2',
        title: 'Brand, Memory & Creative Systems',
        description: 'We build creative platforms that run for years, not weeks, and still feel sharp, relevant, and on-brand.',
        ctaText: 'BRAND AUDIT',
      },
      {
        _key: 'service3',
        title: 'Expansion & Category Ownership',
        description: 'We map SKU expansion, geographic rollout, and category dominance so your brand becomes the default choice.',
        ctaText: 'EXPANSION PLANNING',
      },
      {
        _key: 'service4',
        title: 'Media Buying Power for Challengers',
        description: 'Enterprise-level buying power and pricing without diluting your identity.',
        ctaText: 'MEDIA OPTIMIZATION',
      },
    ],
  },
  {
    _id: 'who-we-serve',
    _type: 'section',
    title: 'Who We Serve',
    slug: { _type: 'slug', current: 'who-we-serve' },
    order: 2,
    isVisible: true,
    content: [
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: "We partner with operators and investors who need marketing to work like an asset, not an experiment. Whether you're a challenger brand, a category disruptor, or a portfolio company scaling post-acquisition, we build engines that compound with your growth.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'p2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's2',
            text: 'CPG & D2C · Retail & Multi-Location · Home Services · Professional Services · Fintech & Cybersecurity · Media & Communications Agencies',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _id: 'how-we-think',
    _type: 'section',
    title: 'How We Think',
    slug: { _type: 'slug', current: 'how-we-think' },
    order: 3,
    isVisible: true,
    content: [
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: "Most teams know that what got them here won't get them to the next level. The missing piece isn't more tactics, it's a clear, credible architecture for growth.",
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
    serviceItems: [
      {
        _key: 'think1',
        title: "95% of your market isn't buying today.",
        description: "We build for that reality, planting demand now so you harvest it later, instead of chasing the same 5% everyone else is fighting over.",
        ctaText: 'DEMAND STRATEGY',
      },
      {
        _key: 'think2',
        title: 'Campaigns should run for years, not quarters.',
        description: 'The strongest brand platforms compound like interest. We build creative systems with that kind of durability.',
        ctaText: 'BRAND PLATFORM',
      },
      {
        _key: 'think3',
        title: 'Memory structures, not metrics theater.',
        description: "We connect emotional insight with cultural context so your brand isn't just seen, it's remembered when it matters.",
        ctaText: 'BRAND MEMORY',
      },
      {
        _key: 'think4',
        title: 'Brand farming over pure hunting.',
        description: 'Hunt-and-close has limits. We shift you toward durable demand generation so growth continues even when campaigns pause.',
        ctaText: 'GROWTH ENGINE',
      },
    ],
  },
  {
    _id: 'results',
    _type: 'section',
    title: 'Results',
    slug: { _type: 'slug', current: 'results' },
    order: 4,
    isVisible: true,
    stats: [
      { _key: 'stat1', value: '+193%', label: 'ROI Increase' },
      { _key: 'stat2', value: '-57%', label: 'CAC Reduction' },
      { _key: 'stat3', value: '+454M', label: 'Impressions' },
      { _key: 'stat4', value: '+38%', label: 'Repeat Customers' },
    ],
    content: [
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: 'Results from a national B2C brand engagement. CB.Media identified $17.46M in sub-optimal media spend and redirected it to drive measurable, compounding impact.',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _id: 'contact',
    _type: 'section',
    title: 'Contact',
    slug: { _type: 'slug', current: 'contact' },
    order: 5,
    isVisible: true,
    content: [
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: "If you like the view from the thirtieth floor, capture it. If you want to see it from the hundredth, let's talk.",
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
]

async function seed() {
  console.log('🌱 Seeding Sanity content...')

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Missing SANITY_API_WRITE_TOKEN')
    console.log('\nTo get a write token:')
    console.log('1. Go to https://sanity.io/manage/project/ctm1hbbr/api')
    console.log('2. Click "Add API token"')
    console.log('3. Name it "Seed Script" with "Editor" permissions')
    console.log('4. Run: SANITY_API_WRITE_TOKEN=your-token pnpm exec tsx scripts/seed-sanity.ts')
    process.exit(1)
  }

  try {
    // Create site settings
    console.log('  Creating site settings...')
    await client.createOrReplace(siteSettings)

    // Create sections
    for (const section of sections) {
      console.log(`  Creating section: ${section.title}...`)
      await client.createOrReplace(section)
    }

    console.log('\n✅ Seeding complete!')
    console.log('\nYou can now:')
    console.log('1. Visit /studio to manage content')
    console.log('2. The site will fetch from Sanity automatically')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
