import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Montserrat } from 'next/font/google'
import { CrispChat } from '@/components/chat/CrispChat'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import './globals.css'

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${montserrat.variable} font-sans`}>
        {children}
        <CrispChat />
        <FeedbackWidget />
      </body>
    </html>
  )
}
