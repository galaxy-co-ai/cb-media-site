'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { SectionHeader } from './SectionHeader'
import type { Section } from '@/sanity/lib/types'

interface GenericSectionProps {
  section: Section
}

export function GenericSection({ section }: GenericSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <SectionHeader title={section.title} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-12 max-w-3xl"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>
    </section>
  )
}
