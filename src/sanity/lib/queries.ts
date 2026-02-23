import { groq } from 'next-sanity'

export const SECTIONS_QUERY = groq`
  *[_type == "section" && isVisible == true] | order(orderRank asc) {
    _id,
    title,
    "slug": slug.current,
    order,
    orderRank,
    content,
    stats,
    serviceItems[] {
      _key,
      title,
      description,
      ctaText,
      ctaLink
    },
    isVisible
  }
`

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    heroHeadline,
    heroTagline,
    heroSubtext,
    contactEmail,
    contactPhone,
    ctaText,
    ctaLink,
    metaTitle,
    metaDescription,
    ogImage {
      asset-> { _id, url },
      hotspot
    },
    favicon {
      asset-> { _id, url }
    },
    socialLinks[] {
      platform,
      url
    },
    logo {
      asset-> { _id, url },
      hotspot
    },
    logoDark {
      asset-> { _id, url },
      hotspot
    }
  }
`
