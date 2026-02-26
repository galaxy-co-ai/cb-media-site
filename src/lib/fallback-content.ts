import type { Section, SiteSettings } from '@/sanity/lib/types'

export const fallbackSiteSettings: SiteSettings = {
  heroHeadline: 'CB MEDIA',
  heroTagline: 'TURNING VISIBILITY INTO VALUE',
  heroSubtext:
    'Architects of culture, community, and impact. Engineering brands for long-term durability, not just short-term spikes.',
  contactEmail: 'info@cb.media',
  regionPhones: [
    { region: 'NA', phone: '+1 (000) 000-0000' },
    { region: 'MENA', phone: '+971 0 000 0000' },
    { region: 'APAC', phone: '+61 0 0000 0000' },
  ],
  ctaText: 'GET IN TOUCH',
  ctaLink: 'mailto:info@cb.media',
}

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
            marks: ['strong'],
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
