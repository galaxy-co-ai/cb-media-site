'use client'

import { useState } from 'react'
import { ConstellationIntro } from '@/components/intro/ConstellationIntro'
import { ParticleBackground } from '@/components/intro/ParticleBackground'
import { Accordion } from '@/components/sections/Accordion'

// Placeholder sections - will be replaced with Sanity data
const sections = [
  {
    id: 'what-we-do',
    title: 'What We Do',
    content: (
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p className="text-lg md:text-xl">
          From broadcast and streaming to digital and out-of-home, we architect
          cohesive brand and direct response campaigns that compound efficiency
          across every channel.
        </p>
        <ul className="space-y-2 text-base md:text-lg">
          <li>• Media Efficiency and Coverage</li>
          <li>• Brand, Memory, and Creative Systems</li>
          <li>• Expansion and Category Ownership</li>
          <li>• Media Buying Power for Challengers</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'who-we-serve',
    title: 'Who We Serve',
    content: (
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p className="text-lg md:text-xl">
          We partner with operators and investors who need marketing to work
          like an asset, not an experiment.
        </p>
        <ul className="space-y-2 text-base md:text-lg">
          <li>• CPG and D2C brands</li>
          <li>• Retail and multi-location concepts</li>
          <li>• Home services and local service networks</li>
          <li>• Professional services and specialty practices</li>
          <li>• Fintech and cybersecurity brands</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'how-we-think',
    title: 'How We Think',
    content: (
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p className="text-lg md:text-xl">
          Most teams know that what got them here will not get them to the next
          level. The missing piece is a clear, credible path forward.
        </p>
        <ul className="space-y-2 text-base md:text-lg">
          <li>• 95% of your market isn't buying today — we build for that reality</li>
          <li>• Campaigns that run for years, not quarters</li>
          <li>• Memory structures, not metrics theater</li>
          <li>• Brand farming over pure hunting</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'results',
    title: 'Results',
    content: (
      <div className="max-w-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-display text-4xl md:text-5xl text-foreground">+193%</div>
            <div className="text-sm text-muted-foreground">ROI Increase</div>
          </div>
          <div>
            <div className="font-display text-4xl md:text-5xl text-foreground">-57%</div>
            <div className="text-sm text-muted-foreground">CAC Reduction</div>
          </div>
          <div>
            <div className="font-display text-4xl md:text-5xl text-foreground">+454M</div>
            <div className="text-sm text-muted-foreground">Impressions</div>
          </div>
          <div>
            <div className="font-display text-4xl md:text-5xl text-foreground">+38%</div>
            <div className="text-sm text-muted-foreground">Repeat Customers</div>
          </div>
        </div>
        <p className="text-muted-foreground">
          Results from a US-based B2C brand. CB.Media identified $17.46M in
          sub-optimal spend and redirected it for maximum impact.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <div className="max-w-3xl space-y-6">
        <p className="text-lg md:text-xl text-muted-foreground">
          Ready to turn visibility into value?
        </p>
        <div className="space-y-2">
          <a
            href="mailto:tothman@CB.MEDIA"
            className="block text-lg text-foreground hover:text-muted-foreground transition-colors"
          >
            tothman@CB.MEDIA
          </a>
          <a
            href="tel:+19198157727"
            className="block text-lg text-foreground hover:text-muted-foreground transition-colors"
          >
            +1 (919) 815-7727
          </a>
        </div>
        <button className="mt-4 px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-display text-xl tracking-wide">
          LET'S TALK
        </button>
      </div>
    ),
  },
]

export default function Home() {
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
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider text-center">
            CB.MEDIA
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-muted-foreground tracking-widest">
            TURN VISIBILITY INTO VALUE
          </p>
          <p className="mt-2 text-lg text-muted-foreground tracking-wider">
            Media. Creative. Culture.
          </p>
        </section>

        {/* Accordion Sections */}
        <section className="px-6 md:px-12 lg:px-24 pb-24">
          <Accordion sections={sections} />
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-6 md:px-12 lg:px-24 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-display text-2xl tracking-wider">CB.MEDIA</span>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CB.Media. All rights reserved.
            </span>
          </div>
        </footer>
      </main>
    </>
  )
}
