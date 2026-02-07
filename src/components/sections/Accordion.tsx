'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Section } from '@/sanity/lib/types'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { StatsGrid } from '@/components/content/StatsGrid'

interface AccordionProps {
  sections: Section[]
}

export function Accordion({ sections }: AccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const scrollPositionRef = useRef<number>(0)

  const getScrollContainer = () => document.querySelector('main')

  const toggleSection = (id: string) => {
    const scrollContainer = getScrollContainer()

    if (openSection === id) {
      // Closing - restore scroll position
      setOpenSection(null)
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollPositionRef.current,
            behavior: 'smooth',
          })
        }, 100)
      }
    } else {
      // Opening - save position and scroll to item
      if (scrollContainer) {
        scrollPositionRef.current = scrollContainer.scrollTop
      }
      setOpenSection(id)

      // Scroll to the item after animation starts
      setTimeout(() => {
        const item = itemRefs.current.get(id)
        if (item) {
          item.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)
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
            <motion.span
              animate={{ rotate: openSection === section._id ? 45 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-3xl md:text-4xl text-muted-foreground"
            >
              +
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {openSection === section._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.3 }
                }}
                className="overflow-hidden"
              >
                <div className="pb-8 md:pb-12">
                  {section.stats && section.stats.length > 0 && (
                    <StatsGrid stats={section.stats} />
                  )}
                  <PortableTextRenderer content={section.content} />
                  {section.slug === 'contact' && <ContactBlock />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function ContactBlock() {
  return (
    <div className="mt-6 space-y-2">
      <a
        href="mailto:info@cb.media"
        className="block text-lg text-foreground hover:text-muted-foreground transition-colors"
      >
        info@cb.media
      </a>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-28">North America</span>
          <a
            href="tel:+10000000000"
            className="text-lg text-foreground hover:text-muted-foreground transition-colors"
          >
            +1 (000) 000-0000
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-28">EMEA</span>
          <a
            href="tel:+440000000000"
            className="text-lg text-foreground hover:text-muted-foreground transition-colors"
          >
            +44 00 0000 0000
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-28">APAC</span>
          <a
            href="tel:+610000000000"
            className="text-lg text-foreground hover:text-muted-foreground transition-colors"
          >
            +61 0 0000 0000
          </a>
        </div>
      </div>
      <button className="mt-4 px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-display text-xl tracking-wide">
        LET'S TALK
      </button>
    </div>
  )
}
