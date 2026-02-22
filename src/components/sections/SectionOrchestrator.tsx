'use client'

import type { Section, SiteSettings } from '@/sanity/lib/types'
import { WhatWeDo } from './WhatWeDo'
import { WhoWeServe } from './WhoWeServe'
import { HowWeThink } from './HowWeThink'
import { ResultsSection } from './ResultsSection'
import { ContactSection } from './ContactSection'
import { GenericSection } from './GenericSection'

const sectionMap: Record<string, React.ComponentType<{ section: Section; siteSettings?: SiteSettings }>> = {
  'what-we-do': WhatWeDo,
  'who-we-serve': WhoWeServe,
  'how-we-think': HowWeThink,
  'results': ResultsSection,
  'contact': ContactSection,
}

interface SectionOrchestratorProps {
  sections: Section[]
  siteSettings: SiteSettings
}

export function SectionOrchestrator({ sections, siteSettings }: SectionOrchestratorProps) {
  return (
    <>
      {sections.map((section) => {
        const Component = sectionMap[section.slug] || GenericSection
        return (
          <div
            key={section._id}
            id={section.slug}
            className="min-h-screen flex flex-col justify-center relative z-[1]"
          >
            <Component section={section} siteSettings={siteSettings} />
          </div>
        )
      })}
    </>
  )
}
