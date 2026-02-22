'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import type { Section } from '@/sanity/lib/types'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { StatsGrid } from '@/components/content/StatsGrid'
import { ServiceGrid } from '@/components/content/ServiceGrid'

interface AccordionProps {
  sections: Section[]
}

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
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Accordion({ sections }: AccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const scrollPositionRef = useRef<number>(0)
  const rafRef = useRef(0)
  const prefersReduced = useReducedMotion()

  const getScrollContainer = () => document.querySelector('main')

  const toggleSection = (id: string) => {
    const scrollContainer = getScrollContainer()

    if (openSection === id) {
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
      if (scrollContainer) {
        scrollPositionRef.current = scrollContainer.scrollTop
      }
      setOpenSection(id)

      setTimeout(() => {
        const item = itemRefs.current.get(id)
        if (item) {
          item.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)
    }
  }

  const handleProximity = useCallback((e: MouseEvent) => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      itemRefs.current.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const itemCenterY = rect.top + rect.height / 2
        const dist = Math.abs(e.clientY - itemCenterY)
        const proximity = Math.max(0, 1 - dist / 150)
        el.style.setProperty('--proximity', String(proximity))
      })
    })
  }, [])

  const handleProximityLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    itemRefs.current.forEach((el) => {
      el.style.setProperty('--proximity', '0')
    })
  }, [])

  useEffect(() => {
    if (prefersReduced) return
    if (!window.matchMedia('(hover: hover)').matches) return
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mousemove', handleProximity)
    container.addEventListener('mouseleave', handleProximityLeave)
    return () => {
      container.removeEventListener('mousemove', handleProximity)
      container.removeEventListener('mouseleave', handleProximityLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleProximity, handleProximityLeave, prefersReduced])

  return (
    <div ref={containerRef} className="w-full">
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
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.5,
          delay: index * 0.06,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className={`border-b border-border border-l-2 pl-4 accordion-item ${
          isOpen ? 'accordion-item-open' : ''
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full py-6 md:py-8 flex items-center justify-between text-left group"
        >
          <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] tracking-wide text-foreground group-hover:text-muted-foreground transition-colors accordion-title">
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
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="mt-4 px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-display text-xl tracking-wide cursor-pointer"
      >
        LET&apos;S TALK
      </motion.button>
    </div>
  )
}
