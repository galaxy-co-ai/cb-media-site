import { groq } from 'next-sanity'

export const SECTIONS_QUERY = groq`
  *[_type == "section" && isVisible == true] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    order,
    content,
    stats,
    isVisible
  }
`

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    description,
    email,
    phone
  }
`
