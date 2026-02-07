/**
 * Update "What We Do" section with serviceItems
 * Run with: pnpm exec tsx scripts/update-service-items.ts
 */

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ctm1hbbr'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const serviceItems = [
  {
    _key: 'service1',
    _type: 'serviceItem',
    title: 'Media Efficiency & Coverage',
    description: 'We deploy budgets where they actually work. We address CAC creep and ROAS decline at the source, not the dashboard.',
    ctaText: 'EFFICIENCY AUDIT',
  },
  {
    _key: 'service2',
    _type: 'serviceItem',
    title: 'Brand, Memory & Creative Systems',
    description: 'We build creative platforms that run for years, not weeks, and still feel sharp, relevant, and on-brand.',
    ctaText: 'BRAND AUDIT',
  },
  {
    _key: 'service3',
    _type: 'serviceItem',
    title: 'Expansion & Category Ownership',
    description: 'We map SKU expansion, geographic rollout, and category dominance so your brand becomes the default choice.',
    ctaText: 'EXPANSION PLANNING',
  },
  {
    _key: 'service4',
    _type: 'serviceItem',
    title: 'Media Buying Power for Challengers',
    description: 'Enterprise-level buying power and pricing without diluting your identity.',
    ctaText: 'MEDIA OPTIMIZATION',
  },
]

// Updated content - just intro paragraph (no bullet lists)
const updatedContent = [
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
]

// Updated "Who We Serve" content with bold categories
const whoWeServeContent = [
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
        marks: ['strong'],
      },
    ],
    markDefs: [],
  },
]

async function update() {
  console.log('🔄 Updating content with service cards...')

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Missing SANITY_API_WRITE_TOKEN')
    console.log('\nTo get a write token:')
    console.log('1. Go to https://sanity.io/manage/project/ctm1hbbr/api')
    console.log('2. Click "Add API token"')
    console.log('3. Name it "Update Script" with "Editor" permissions')
    console.log('4. Run: SANITY_API_WRITE_TOKEN=your-token pnpm exec tsx scripts/update-service-items.ts')
    process.exit(1)
  }

  try {
    // Update "What We Do" section
    console.log('  Updating "What We Do" with service cards...')
    await client
      .patch('what-we-do')
      .set({
        content: updatedContent,
        serviceItems: serviceItems,
      })
      .commit()

    // Update "Who We Serve" section with bold categories
    console.log('  Updating "Who We Serve" with bold categories...')
    await client
      .patch('who-we-serve')
      .set({
        content: whoWeServeContent,
      })
      .commit()

    console.log('\n✅ Update complete!')
    console.log('\nRefresh the site to see the changes.')
  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  }
}

update()
