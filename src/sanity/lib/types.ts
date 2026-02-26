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
  orderRank?: string
  content: PortableTextBlock[]
  stats?: Stat[]
  serviceItems?: ServiceItem[]
  isVisible: boolean
}

export interface ResolvedImage {
  asset?: { _id: string; url: string }
  hotspot?: { x: number; y: number }
}

export interface SocialLink {
  platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube'
  url: string
}

export interface RegionPhone {
  region: string
  phone: string
}

export interface SiteSettings {
  heroHeadline?: string
  heroTagline?: string
  heroSubtext?: string
  contactEmail?: string
  regionPhones?: RegionPhone[]
  ctaText?: string
  ctaLink?: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: ResolvedImage
  favicon?: { asset?: { _id: string; url: string } }
  socialLinks?: SocialLink[]
  logo?: ResolvedImage
  logoDark?: ResolvedImage
}
