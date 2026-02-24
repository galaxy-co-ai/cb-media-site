'use client'

import { useEffect } from 'react'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'
import '../../../sanity/studio.css'

export default function StudioPage() {
  useEffect(() => {
    // Signal CSS to restore scrollbars and disable Lenis styles for Studio
    document.documentElement.classList.add('sanity-studio')
    return () => {
      document.documentElement.classList.remove('sanity-studio')
    }
  }, [])

  return <NextStudio config={config} />
}
