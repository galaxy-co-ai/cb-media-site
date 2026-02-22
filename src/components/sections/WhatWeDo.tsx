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
      className="relative py-16 md:py-24 px-6 md:px-10 lg:px-16"
    >
      <SectionHeader title={section.title} />

      {/* Intro text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-6 mb-12 max-w-3xl text-muted-foreground"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>

      {/* Desktop: Two-column hover list */}
      <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Service titles */}
        <div className="space-y-0">
          {services.map((item, i) => (
            <motion.button
              key={item._key}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full text-left py-4 border-b border-border group flex items-baseline gap-4 transition-colors duration-200 ${
                activeIndex === i
                  ? 'border-l-2 border-l-[var(--accent-glow)] pl-4'
                  : 'border-l-2 border-l-transparent pl-4'
              }`}
            >
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-sm text-muted-foreground tabular-nums"
              >
                {String(i + 1).padStart(2, '0')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.45 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`font-display text-xl lg:text-2xl tracking-wide transition-colors duration-200 ${
                  activeIndex === i ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.title}
              </motion.span>
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
                <p className="text-base text-muted-foreground leading-relaxed">
                  {services[activeIndex].description}
                </p>
                {services[activeIndex].ctaText && (
                  <span className="inline-block mt-4 font-display text-sm tracking-wider text-[var(--accent-glow)]">
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
              className="w-full py-4 flex items-baseline justify-between text-left"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-sm text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-lg tracking-wide text-foreground">
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
