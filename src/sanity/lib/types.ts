import type { PortableTextBlock } from 'next-sanity'

export interface Stat {
  value: string
  label: string
}

export interface Section {
  _id: string
  title: string
  slug: string
  order: number
  content: PortableTextBlock[]
  stats?: Stat[]
  isVisible: boolean
}

export interface SiteSettings {
  siteName?: string
  tagline?: string
  description?: string
  email?: string
  phone?: string
}
