import { sanityFetch } from '@/sanity/lib/client'
import { SECTIONS_QUERY } from '@/sanity/lib/queries'
import { isSanityConfigured } from '@/sanity/env'
import { fallbackSections } from '@/lib/fallback-content'
import type { Section } from '@/sanity/lib/types'
import { HomeClient } from './HomeClient'

export default async function Home() {
  let sections: Section[] = fallbackSections

  if (isSanityConfigured) {
    try {
      const sanityData = await sanityFetch<Section[]>({
        query: SECTIONS_QUERY,
        tags: ['sections'],
      })
      if (sanityData && sanityData.length > 0) {
        sections = sanityData
      }
    } catch (error) {
      console.error('Failed to fetch from Sanity, using fallback content:', error)
    }
  }

  return <HomeClient sections={sections} />
}
