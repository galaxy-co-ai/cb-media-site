'use client'

import type { Section } from '@/sanity/lib/types'
import { WhatWeDo } from './WhatWeDo'
import { WhoWeServe } from './WhoWeServe'
import { HowWeThink } from './HowWeThink'
import { ResultsSection } from './ResultsSection'
import { ContactSection } from './ContactSection'
import { GenericSection } from './GenericSection'

const sectionMap: Record<string, React.ComponentType<{ section: Section }>> = {
  'what-we-do': WhatWeDo,
  'who-we-serve': WhoWeServe,
  'how-we-think': HowWeThink,
  'results': ResultsSection,
  'contact': ContactSection,
}

interface SectionOrchestratorProps {
  sections: Section[]
}

export function SectionOrchestrator({ sections }: SectionOrchestratorProps) {
  return (
    <>
      {sections.map((section) => {
        const Component = sectionMap[section.slug] || GenericSection
        return (
          <Component
            key={section._id}
            section={section}
          />
        )
      })}
    </>
  )
}
