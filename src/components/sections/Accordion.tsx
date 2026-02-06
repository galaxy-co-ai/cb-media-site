'use client'

import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import type { Section } from '@/sanity/lib/types'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { StatsGrid } from '@/components/content/StatsGrid'

interface AccordionProps {
  sections: Section[]
}

export function Accordion({ sections }: AccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const scrollPositionRef = useRef<number>(0)

  const getScrollContainer = () => {
    // The main element has overflow-y-auto
    return document.querySelector('main')
  }

  const toggleSection = (id: string) => {
    const scrollContainer = getScrollContainer()

    if (openSection === id) {
      // Close current section - restore scroll position
      const content = contentRefs.current.get(id)
      if (content) {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => {
            // Restore scroll position after close animation
            if (scrollContainer) {
              scrollContainer.scrollTo({
                top: scrollPositionRef.current,
                behavior: 'smooth',
              })
            }
          },
        })
      }
      setOpenSection(null)
    } else {
      // Save current scroll position before opening
      if (scrollContainer) {
        scrollPositionRef.current = scrollContainer.scrollTop
      }

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
      const item = itemRefs.current.get(id)
      if (content) {
        gsap.fromTo(
          content,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              // Scroll the accordion item into view after opening
              if (item) {
                item.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            },
          }
        )
      }
    }
  }

  return (
    <div className="w-full">
      {sections.map((section) => (
        <div
          key={section._id}
          ref={(el) => {
            if (el) itemRefs.current.set(section._id, el)
          }}
          className="border-b border-border"
        >
          <button
            onClick={() => toggleSection(section._id)}
            className="w-full py-6 md:py-8 flex items-center justify-between text-left group"
          >
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wide text-foreground group-hover:text-muted-foreground transition-colors">
              {section.title}
            </h2>
            <span
              className={`text-3xl md:text-4xl text-muted-foreground transition-transform duration-300 ${
                openSection === section._id ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>

          <div
            ref={(el) => {
              if (el) contentRefs.current.set(section._id, el)
            }}
            className="overflow-hidden"
            style={{ height: 0, opacity: 0 }}
          >
            <div className="pb-8 md:pb-12">
              {section.stats && section.stats.length > 0 && (
                <StatsGrid stats={section.stats} />
              )}
              <PortableTextRenderer content={section.content} />
              {section.slug === 'contact' && <ContactBlock />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactBlock() {
  return (
    <div className="mt-6 space-y-2">
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
      <button className="mt-4 px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-display text-xl tracking-wide">
        LET'S TALK
      </button>
    </div>
  )
}
