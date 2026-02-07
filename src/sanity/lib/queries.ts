import { groq } from 'next-sanity'

export const SECTIONS_QUERY = groq`
  *[_type == "section" && isVisible == true] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    order,
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
    ctaLink
  }
`
