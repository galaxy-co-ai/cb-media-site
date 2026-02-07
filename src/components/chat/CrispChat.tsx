'use client'

import { useEffect } from 'react'

const CRISP_WEBSITE_ID = '285bad61-3f0b-4120-b2eb-b10844abf290'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

export function CrispChat() {
  useEffect(() => {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID

    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}
