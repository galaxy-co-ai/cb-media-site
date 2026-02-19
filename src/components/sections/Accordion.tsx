'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import type { Section } from '@/sanity/lib/types'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { StatsGrid } from '@/components/content/StatsGrid'
import { ServiceGrid } from '@/components/content/ServiceGrid'

interface AccordionProps {
  sections: Section[]
}

// ── P8: Staggered content container variants ──────────────────
const contentStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const contentChild = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
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
      {sections.map((section, index) => (
        <AccordionItem
          key={section._id}
          section={section}
          index={index}
          isOpen={openSection === section._id}
          onToggle={() => toggleSection(section._id)}
          ref={(el) => {
            if (el) itemRefs.current.set(section._id, el)
          }}
        />
      ))}
    </div>
  )
}

// ── P8: Each item reveals on viewport entry ─────────────────
import { forwardRef } from 'react'

interface AccordionItemProps {
  section: Section
  index: number
  isOpen: boolean
  onToggle: () => void
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ section, index, isOpen, onToggle }, ref) {
    const inViewRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(inViewRef, { once: true, margin: '-30px' })

    return (
      <motion.div
        ref={(el) => {
          // Assign to both refs
          (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.5,
          delay: index * 0.05,
          ease: [0.33, 1, 0.68, 1] as const,
        }}
        className={`border-b border-border transition-all duration-200 accordion-item ${
          isOpen
            ? 'border-l-2 border-l-white pl-4'
            : 'border-l-2 border-l-transparent pl-4'
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full py-6 md:py-8 flex items-center justify-between text-left group"
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wide text-foreground group-hover:text-muted-foreground transition-colors accordion-title">
            {section.title}
          </h2>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="text-3xl md:text-4xl text-muted-foreground"
          >
            +
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { type: 'spring', stiffness: 120, damping: 28 },
                opacity: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
              }}
              className="overflow-hidden"
            >
              {/* P8: Staggered children inside expanded content */}
              <motion.div
                className="pb-8 md:pb-12"
                variants={contentStagger}
                initial="hidden"
                animate="visible"
              >
                {section.stats && section.stats.length > 0 && (
                  <motion.div variants={contentChild}>
                    <StatsGrid stats={section.stats} />
                  </motion.div>
                )}
                <motion.div variants={contentChild}>
                  <PortableTextRenderer content={section.content} />
                </motion.div>
                {section.serviceItems && section.serviceItems.length > 0 && (
                  <motion.div variants={contentChild} className="mt-8">
                    <ServiceGrid items={section.serviceItems} />
                  </motion.div>
                )}
                {section.slug === 'contact' && (
                  <motion.div variants={contentChild}>
                    <ContactBlock />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

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
        LET&apos;S TALK
      </button>
    </div>
  )
}
