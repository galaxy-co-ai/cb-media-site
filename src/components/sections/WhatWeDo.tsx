'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { SectionHeader } from './SectionHeader'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import type { Section } from '@/sanity/lib/types'

interface WhatWeDoProps {
  section: Section
}

export function WhatWeDo({ section }: WhatWeDoProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const services = section.serviceItems || []

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <SectionHeader title={section.title} />

      {/* Intro text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8 mb-16 max-w-3xl text-muted-foreground"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>

      {/* Desktop: Two-column hover list */}
      <div className="hidden md:grid md:grid-cols-2 gap-12 lg:gap-24">
        {/* Left: Service titles */}
        <div className="space-y-0">
          {services.map((item, i) => (
            <motion.button
              key={item._key}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className={`w-full text-left py-6 border-b border-border group flex items-baseline gap-4 transition-colors duration-200 ${
                activeIndex === i
                  ? 'border-l-2 border-l-[var(--accent-glow)] pl-4'
                  : 'border-l-2 border-l-transparent pl-4'
              }`}
            >
              <span className="font-display text-sm text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`font-display text-2xl lg:text-3xl tracking-wide transition-colors duration-200 ${
                  activeIndex === i ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.title}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Right: Description panel */}
        <div className="relative min-h-[200px] flex items-start pt-6">
          <AnimatePresence mode="wait">
            {services[activeIndex] && (
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {services[activeIndex].description}
                </p>
                {services[activeIndex].ctaText && (
                  <span className="inline-block mt-6 font-display text-sm tracking-wider text-[var(--accent-glow)]">
                    {services[activeIndex].ctaText} &rarr;
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Tap-to-expand cards */}
      <div className="md:hidden space-y-4">
        {services.map((item, i) => (
          <motion.div
            key={item._key}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            className="border-b border-border"
          >
            <button
              onClick={() => setExpandedMobile(expandedMobile === i ? null : i)}
              className="w-full py-5 flex items-baseline justify-between text-left"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-sm text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-xl tracking-wide text-foreground">
                  {item.title}
                </span>
              </div>
              <motion.span
                animate={{ rotate: expandedMobile === i ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="text-2xl text-muted-foreground"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {expandedMobile === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { type: 'spring', stiffness: 120, damping: 28 },
                    opacity: { duration: 0.3 },
                  }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
