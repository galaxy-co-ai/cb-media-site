import { sanityFetch } from '@/sanity/lib/client'
import { SECTIONS_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { isSanityConfigured } from '@/sanity/env'
import { fallbackSections, fallbackSiteSettings } from '@/lib/fallback-content'
import type { Section, SiteSettings } from '@/sanity/lib/types'
import { HomeClient } from './HomeClient'

export default async function Home() {
  let sections: Section[] = fallbackSections
  let siteSettings: SiteSettings = fallbackSiteSettings

  if (isSanityConfigured) {
    try {
      const [sanityData, settingsData] = await Promise.all([
        sanityFetch<Section[]>({ query: SECTIONS_QUERY, tags: ['sections'] }),
        sanityFetch<SiteSettings | null>({ query: SITE_SETTINGS_QUERY, tags: ['siteSettings'] }),
      ])
      if (sanityData && sanityData.length > 0) {
        sections = sanityData
      }
      if (settingsData) {
        siteSettings = { ...fallbackSiteSettings, ...settingsData }
      }
    } catch {
      // Fallback content is already set
    }
  }

  return <HomeClient sections={sections} siteSettings={siteSettings} />
}
