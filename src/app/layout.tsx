import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Montserrat } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'

import './globals.css'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'

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

export const metadata: Metadata = {
  title: 'CB.Media | Turn Visibility Into Value',
  description:
    'CB.Media is the media, brand, and culture specialist. We design and run scalable marketing engines that translate attention into durable brand equity.',
  keywords: [
    'media agency',
    'brand strategy',
    'creative agency',
    'marketing',
    'culture',
  ],
  icons: {
    icon: '/favicon.svg',
  },
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
        {draft.isEnabled && <VisualEditing />}
      </body>
    </html>
  )
}
