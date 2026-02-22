'use client'

import { useEffect, useRef } from 'react'
import {
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  motion,
} from 'framer-motion'
import type { Stat } from '@/sanity/lib/types'

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  if (!stats || stats.length === 0) {
    return null
  }

  const containerRef = useRef<HTMLDivElement>(null)

  // Drive the spine height by scroll progress through the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.6'],
  })
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div ref={containerRef} className="relative py-12 mb-8">
      {/* ── Vertical spine (center) ─────────────────────────── */}
      <div className="absolute left-1/2 top-12 bottom-12 -translate-x-1/2 w-px">
        {/* Track (faint) */}
        <div className="absolute inset-0 bg-white/[0.06]" />
        {/* Fill (draws on scroll) */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-white/20"
          style={{ height: spineHeight }}
        />
      </div>

      {/* ── Stat rows ───────────────────────────────────────── */}
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
  )
}

// ── Single timeline row ──────────────────────────────────────
function TimelineRow({
  stat,
  index,
  isLeft,
}: {
  stat: Stat
  index: number
  isLeft: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(rowRef, { once: true, margin: '-80px' })

  return (
    <div ref={rowRef} className="relative grid grid-cols-[1fr_auto_1fr] items-center">
      {/* ── Left column ──────────────────────────────────── */}
      <div className={`${isLeft ? 'pr-6 md:pr-12' : ''} flex ${isLeft ? 'justify-end' : ''}`}>
        {isLeft && (
          <AnimatedStat stat={stat} index={index} isInView={isInView} align="right" />
        )}
      </div>

      {/* ── Center node + branch ─────────────────────────── */}
      <div className="relative flex items-center justify-center w-16 md:w-24">
        {/* Horizontal branch */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 h-px bg-white/20 ${
            isLeft ? 'right-1/2 left-0' : 'left-1/2 right-0'
          }`}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
          style={{ transformOrigin: isLeft ? 'right' : 'left' }}
        />
        {/* Node dot */}
        <motion.div
          className="relative z-10 w-2 h-2 rounded-full bg-white/30 ring-[3px] ring-black"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        />
      </div>

      {/* ── Right column ─────────────────────────────────── */}
      <div className={`${!isLeft ? 'pl-6 md:pl-12' : ''} flex ${!isLeft ? 'justify-start' : ''}`}>
        {!isLeft && (
          <AnimatedStat stat={stat} index={index} isInView={isInView} align="left" />
        )}
      </div>
    </div>
  )
}

// ── Animated stat counter ────────────────────────────────────
function AnimatedStat({
  stat,
  index,
  isInView,
  align,
}: {
  stat: Stat
  index: number
  isInView: boolean
  align: 'left' | 'right'
}) {
  const { numericValue, prefix, suffix } = parseStatValue(stat.value)
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 })
  const displayRef = useRef<HTMLSpanElement>(null)
  const delay = 0.25

  useEffect(() => {
    if (isInView && numericValue !== null) {
      const timeout = setTimeout(() => {
        motionVal.set(numericValue)
      }, delay * 1000)
      return () => clearTimeout(timeout)
    }
  }, [isInView, numericValue, motionVal])

  useEffect(() => {
    if (numericValue === null) return
    const unsub = springVal.on('change', (latest) => {
      if (displayRef.current) {
        const rounded = Number.isInteger(numericValue)
          ? Math.round(latest)
          : parseFloat(latest.toFixed(1))
        displayRef.current.textContent = `${prefix}${rounded}${suffix}`
      }
    })
    return unsub
  }, [springVal, numericValue, prefix, suffix])

  const slideFrom = align === 'left' ? -30 : 30

  return (
    <motion.div
      initial={{ opacity: 0, x: slideFrom }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }}
      className={align === 'right' ? 'text-right' : 'text-left'}
    >
      <div className="font-display text-[clamp(2.25rem,4vw,3rem)] text-foreground tabular-nums leading-none">
        {numericValue !== null ? (
          <span ref={displayRef}>{`${prefix}0${suffix}`}</span>
        ) : (
          stat.value
        )}
      </div>
      <div className="text-sm text-muted-foreground tracking-widest uppercase mt-2">
        {stat.label}
      </div>
    </motion.div>
  )
}

function parseStatValue(value: string): {
  numericValue: number | null
  prefix: string
  suffix: string
} {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/)
  if (!match) return { numericValue: null, prefix: '', suffix: '' }

  return {
    prefix: match[1],
    numericValue: parseFloat(match[2]),
    suffix: match[3],
  }
}
