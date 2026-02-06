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
            text: 'From broadcast and streaming to digital and out-of-home, we architect cohesive brand and direct response campaigns that compound efficiency across every channel.',
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
          { _type: 'span', _key: 'l1', text: 'Media Efficiency and Coverage', marks: [] },
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
          { _type: 'span', _key: 'l2', text: 'Brand, Memory, and Creative Systems', marks: [] },
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
          { _type: 'span', _key: 'l3', text: 'Expansion and Category Ownership', marks: [] },
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
          { _type: 'span', _key: 'l4', text: 'Media Buying Power for Challengers', marks: [] },
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
            text: 'We partner with operators and investors who need marketing to work like an asset, not an experiment.',
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
          { _type: 'span', _key: 'l1', text: 'CPG and D2C brands', marks: [] },
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
          { _type: 'span', _key: 'l2', text: 'Retail and multi-location concepts', marks: [] },
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
          { _type: 'span', _key: 'l3', text: 'Home services and local service networks', marks: [] },
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
          { _type: 'span', _key: 'l4', text: 'Professional services and specialty practices', marks: [] },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'list5',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          { _type: 'span', _key: 'l5', text: 'Fintech and cybersecurity brands', marks: [] },
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
            text: 'Most teams know that what got them here will not get them to the next level. The missing piece is a clear, credible path forward.',
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
          { _type: 'span', _key: 'l1', text: "95% of your market isn't buying today — we build for that reality", marks: [] },
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
          { _type: 'span', _key: 'l2', text: 'Campaigns that run for years, not quarters', marks: [] },
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
          { _type: 'span', _key: 'l3', text: 'Memory structures, not metrics theater', marks: [] },
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
          { _type: 'span', _key: 'l4', text: 'Brand farming over pure hunting', marks: [] },
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
            text: 'Results from a US-based B2C brand. CB.Media identified $17.46M in sub-optimal spend and redirected it for maximum impact.',
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
            text: 'Ready to turn visibility into value?',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
  },
]
