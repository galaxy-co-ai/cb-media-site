import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Montserrat } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'

import './globals.css'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
import { SanityLive } from '@/sanity/lib/live'
import { sanityFetch } from '@/sanity/lib/client'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import type { SiteSettings } from '@/sanity/lib/types'
import { isSanityConfigured } from '@/sanity/env'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
})

const montserrat = Montserrat({
  variable: '--font-hero',
  weight: ['600'],
  subsets: ['latin'],
})

const FALLBACK_META = {
  title: 'CB.Media | Turn Visibility Into Value',
  description:
    'CB.Media is the media, brand, and culture specialist. We design and run scalable marketing engines that translate attention into durable brand equity.',
}

export async function generateMetadata(): Promise<Metadata> {
  if (!isSanityConfigured) {
    return {
      ...FALLBACK_META,
      keywords: ['media agency', 'brand strategy', 'creative agency', 'marketing', 'culture'],
      icons: { icon: '/favicon.svg' },
    }
  }

  try {
    const settings = await sanityFetch<SiteSettings | null>({
      query: SITE_SETTINGS_QUERY,
      tags: ['siteSettings'],
    })

    const title = settings?.metaTitle || FALLBACK_META.title
    const description = settings?.metaDescription || FALLBACK_META.description
    const ogImageUrl = settings?.ogImage?.asset?.url

    return {
      title,
      description,
      keywords: ['media agency', 'brand strategy', 'creative agency', 'marketing', 'culture'],
      icons: { icon: '/favicon.svg' },
      openGraph: {
        title,
        description,
        ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    }
  } catch {
    return {
      ...FALLBACK_META,
      keywords: ['media agency', 'brand strategy', 'creative agency', 'marketing', 'culture'],
      icons: { icon: '/favicon.svg' },
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const draft = await draftMode()

  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${montserrat.variable} font-sans`}>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <SanityLive />
        {draft.isEnabled && <VisualEditing />}
      </body>
    </html>
  )
}
