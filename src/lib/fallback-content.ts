import type { Section } from '@/sanity/lib/types'

// Fallback sections when Sanity is not configured
// These use a simplified structure that matches the Sanity schema
export const fallbackSections: Section[] = [
  {
    _id: 'what-we-do',
    title: 'What We Do',
    slug: 'what-we-do',
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
      {
        _type: 'block',
        _key: 'list1',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l1a', text: 'Media Efficiency & Coverage', marks: ['strong'] },
          { _type: 'span', _key: 'l1b', text: ' - We deploy budgets where they actually work. We address CAC creep and ROAS decline at the source, not the dashboard.', marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list2',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l2a', text: 'Brand, Memory & Creative Systems', marks: ['strong'] },
          { _type: 'span', _key: 'l2b', text: ' - We build creative platforms that run for years, not weeks, and still feel sharp, relevant, and on-brand.', marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list3',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l3a', text: 'Expansion & Category Ownership', marks: ['strong'] },
          { _type: 'span', _key: 'l3b', text: ' - We map SKU expansion, geographic rollout, and category dominance so your brand becomes the default choice.', marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list4',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l4a', text: 'Media Buying Power for Challengers', marks: ['strong'] },
          { _type: 'span', _key: 'l4b', text: ' - Enterprise-level buying power and pricing without diluting your identity.', marks: [] },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _id: 'who-we-serve',
    title: 'Who We Serve',
    slug: 'who-we-serve',
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
            text: 'CPG & D2C \u00B7 Retail & Multi-Location \u00B7 Home Services \u00B7 Professional Services \u00B7 Fintech & Cybersecurity \u00B7 Media & Communications Agencies',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _id: 'how-we-think',
    title: 'How We Think',
    slug: 'how-we-think',
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
      {
        _type: 'block',
        _key: 'list1',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l1a', text: "95% of your market isn't buying today.", marks: ['strong'] },
          { _type: 'span', _key: 'l1b', text: " We build for that reality, planting demand now so you harvest it later, instead of chasing the same 5% everyone else is fighting over.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list2',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l2a', text: 'Campaigns should run for years, not quarters.', marks: ['strong'] },
          { _type: 'span', _key: 'l2b', text: ' The strongest brand platforms compound like interest. We build creative systems with that kind of durability.', marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list3',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l3a', text: 'Memory structures, not metrics theater.', marks: ['strong'] },
          { _type: 'span', _key: 'l3b', text: " We connect emotional insight with cultural context so your brand isn't just seen, it's remembered when it matters.", marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list4',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l4a', text: 'Brand farming over pure hunting.', marks: ['strong'] },
          { _type: 'span', _key: 'l4b', text: ' Hunt-and-close has limits. We shift you toward durable demand generation so growth continues even when campaigns pause.', marks: [] },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _id: 'results',
    title: 'Results',
    slug: 'results',
    order: 4,
    isVisible: true,
    stats: [
      { value: '+193%', label: 'ROI Increase' },
      { value: '-57%', label: 'CAC Reduction' },
      { value: '+454M', label: 'Impressions' },
      { value: '+38%', label: 'Repeat Customers' },
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
    title: 'Contact',
    slug: 'contact',
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
