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
      className="relative py-16 md:py-24 px-6 md:px-10 lg:px-16"
    >
      <SectionHeader title={section.title} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 max-w-3xl"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>
    </section>
  )
}
