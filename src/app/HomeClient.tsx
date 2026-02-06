'use client'

import { useState } from 'react'
import { ConstellationIntro } from '@/components/intro/ConstellationIntro'
import { ParticleBackground } from '@/components/intro/ParticleBackground'
import { Accordion } from '@/components/sections/Accordion'
import type { Section } from '@/sanity/lib/types'

interface HomeClientProps {
  sections: Section[]
}

export function HomeClient({ sections }: HomeClientProps) {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      {/* Intro Animation */}
      {!introComplete && (
        <ConstellationIntro onComplete={() => setIntroComplete(true)} />
      )}

      {/* Persistent Particle Background */}
      <ParticleBackground />

      {/* Main Content */}
      <main className="h-screen overflow-y-auto snap-y snap-proximity">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 snap-start">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider text-center">
            CB.MEDIA
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-muted-foreground tracking-widest">
            TURN VISIBILITY INTO VALUE
          </p>
          <p className="mt-4 text-base md:text-lg text-muted-foreground tracking-wide text-center max-w-2xl">
            Architects of culture, community, and impact. Engineering brands for long-term durability, not just short-term spikes.
          </p>
        </section>

        {/* Accordion Sections */}
        <section className="min-h-screen flex flex-col snap-start">
          <div className="flex-1 px-6 md:px-12 lg:px-24 pt-12 pb-8">
            <Accordion sections={sections} />
          </div>

          {/* Footer */}
          <footer className="border-t border-border px-6 md:px-12 lg:px-24 py-8 mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-display text-2xl tracking-wider">CB.MEDIA</span>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} CB.Media. All rights reserved.
              </span>
            </div>
          </footer>
        </section>
      </main>
    </>
  )
}
