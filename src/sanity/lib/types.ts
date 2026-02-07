import type { PortableTextBlock } from 'next-sanity'

export interface Stat {
  value: string
  label: string
}

export interface ServiceItem {
  _key: string
  title: string
  description: string
  ctaText: string
  ctaLink?: string
}

export interface Section {
  _id: string
  title: string
  slug: string
  order: number
  content: PortableTextBlock[]
  stats?: Stat[]
  serviceItems?: ServiceItem[]
  isVisible: boolean
}

export interface SiteSettings {
  heroHeadline?: string
  heroTagline?: string
  heroSubtext?: string
  contactEmail?: string
  contactPhone?: string
  ctaText?: string
  ctaLink?: string
}
