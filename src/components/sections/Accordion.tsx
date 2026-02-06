'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface AccordionSection {
  id: string
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  sections: AccordionSection[]
}

export function Accordion({ sections }: AccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const toggleSection = (id: string) => {
    if (openSection === id) {
      // Close current section
      const content = contentRefs.current.get(id)
      if (content) {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        })
      }
      setOpenSection(null)
    } else {
      // Close previous section
      if (openSection) {
        const prevContent = contentRefs.current.get(openSection)
        if (prevContent) {
          gsap.to(prevContent, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
          })
        }
      }

      // Open new section
      setOpenSection(id)
      const content = contentRefs.current.get(id)
      if (content) {
        gsap.fromTo(
          content,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          }
        )
      }
    }
  }

  return (
    <div className="w-full">
      {sections.map((section) => (
        <div key={section.id} className="border-b border-border">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full py-6 md:py-8 flex items-center justify-between text-left group"
          >
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wide text-foreground group-hover:text-muted-foreground transition-colors">
              {section.title}
            </h2>
            <span
              className={`text-3xl md:text-4xl text-muted-foreground transition-transform duration-300 ${
                openSection === section.id ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>

          <div
            ref={(el) => {
              if (el) contentRefs.current.set(section.id, el)
            }}
            className="overflow-hidden"
            style={{ height: 0, opacity: 0 }}
          >
            <div className="pb-8 md:pb-12">
              {section.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
