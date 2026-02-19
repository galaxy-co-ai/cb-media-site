'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionHeader } from './SectionHeader'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { DigitRoll } from '@/components/ui/DigitRoll'
import type { Section } from '@/sanity/lib/types'

interface ResultsSectionProps {
  section: Section
}

export function ResultsSection({ section }: ResultsSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const stats = section.stats || []

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <SectionHeader title={section.title} />

      {/* Supporting narrative text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8 mb-16 max-w-3xl text-muted-foreground"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>

      {/* Stats — alternating narrative rows */}
      <div className="space-y-16 md:space-y-24">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className={`flex flex-col ${
              i % 2 === 0 ? 'md:items-start' : 'md:items-end'
            }`}
          >
            <DigitRoll
              value={stat.value}
              className="text-6xl md:text-8xl lg:text-9xl"
            />
            <p className="mt-2 font-display text-lg md:text-xl tracking-wider text-muted-foreground uppercase">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
