'use client'

import dynamic from 'next/dynamic'

const CrystalIntro = dynamic(
  () => import('@/components/intro-v2/CrystalIntro'),
  { ssr: false },
)

export default function IntroV2Page() {
  return <CrystalIntro />
}
