import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-display',
  weight: '400',
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
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
