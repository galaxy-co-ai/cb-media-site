'use client'

import dynamic from 'next/dynamic'

const GalaxyIntro = dynamic(
  () => import('@/components/intro-v2/GalaxyIntro'),
  { ssr: false },
)

export default function IntroV2Page() {
  return <GalaxyIntro />
}
