'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { SectionHeader } from './SectionHeader'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { DigitRoll } from '@/components/ui/DigitRoll'
import type { Section } from '@/sanity/lib/types'

/* ─── Animation constants ─── */

const branchEase: [number, number, number, number] = [0.33, 1, 0.68, 1]

/* ─── Component ─── */

interface ResultsSectionProps {
  section: Section
}

export function ResultsSection({ section }: ResultsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const stats = section.stats || []

  // Scroll-driven spine fill
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.85', 'end 0.4'],
  })
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 px-6 md:px-10 lg:px-16"
    >
      <SectionHeader title={section.title} />

      {/* Supporting narrative text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-6 mb-12 max-w-3xl text-muted-foreground"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative py-4">
        {/* ── Vertical spine ── */}
        <div
          className="absolute left-4 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-px"
          aria-hidden="true"
        >
          {/* Faint track */}
          <div className="absolute inset-0 bg-white/[0.06]" />
          {/* Scroll-driven fill */}
          <motion.div
            className="absolute top-0 left-0 w-full bg-white/20"
            style={{ height: spineHeight }}
          />
        </div>

        {/* ── Stat rows ── */}
        <div className="flex flex-col gap-16 md:gap-24">
          {stats.map((stat, index) => (
            <TimelineRow
              key={index}
              stat={stat}
              index={index}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Timeline row ─── */

function TimelineRow({
  stat,
  index,
  isLeft,
}: {
  stat: { value: string; label: string }
  index: number
  isLeft: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(rowRef, { once: true, margin: '-80px' })

  return (
    <div ref={rowRef} className="relative grid grid-cols-[1fr_32px_1fr] md:grid-cols-[1fr_auto_1fr] items-center">
      {/* ── Left column ── */}
      <div className={`${isLeft ? 'pr-4 md:pr-12' : ''} ${isLeft ? 'hidden md:flex md:justify-end' : ''}`}>
        {isLeft && (
          <StatContent stat={stat} isInView={isInView} align="right" />
        )}
      </div>
      {/* Mobile fallback: left-side stats render on the right (all stats right of spine on mobile) */}
      {isLeft && (
        <div className="md:hidden col-start-3 pl-4">
          <StatContent stat={stat} isInView={isInView} align="left" />
        </div>
      )}

      {/* ── Center node + branch ── */}
      <div className={`relative flex items-center justify-center w-8 md:w-24 ${isLeft ? 'row-start-1 col-start-2' : ''}`}>
        {/* Horizontal branch */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 h-px bg-white/15 ${
            isLeft
              ? 'left-1/2 right-0 origin-left md:right-1/2 md:left-0 md:origin-right'
              : 'left-1/2 right-0 origin-left'
          }`}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: branchEase }}
        />
        {/* Dot node */}
        <motion.div
          className="relative z-10 w-2 h-2 rounded-full bg-white/30 ring-[3px] ring-black"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        />
      </div>

      {/* ── Right column ── */}
      <div className={`${!isLeft ? 'pl-4 md:pl-12 flex justify-start' : 'hidden md:block'}`}>
        {!isLeft && (
          <StatContent stat={stat} isInView={isInView} align="left" />
        )}
      </div>
    </div>
  )
}

/* ─── Stat content (DigitRoll + label) ─── */

function StatContent({
  stat,
  isInView,
  align,
}: {
  stat: { value: string; label: string }
  isInView: boolean
  align: 'left' | 'right'
}) {
  const slideFrom = align === 'right' ? -30 : 30

  return (
    <motion.div
      initial={{ opacity: 0, x: slideFrom }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.25, ease: branchEase }}
      className={align === 'right' ? 'text-right' : 'text-left'}
    >
      <DigitRoll
        value={stat.value}
        className="text-[clamp(3rem,8vw,6rem)]"
      />
      <p className="mt-2 font-display text-base md:text-lg tracking-wider text-muted-foreground uppercase">
        {stat.label}
      </p>
    </motion.div>
  )
}
