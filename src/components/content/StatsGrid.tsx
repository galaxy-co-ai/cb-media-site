'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, motion } from 'framer-motion'
import type { Stat } from '@/sanity/lib/types'

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  if (!stats || stats.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      {stats.map((stat, index) => (
        <AnimatedStat key={index} stat={stat} delay={index * 0.1} />
      ))}
    </div>
  )
}

// ── P8: Animated counter for each stat ──────────────────────
function AnimatedStat({ stat, delay }: { stat: Stat; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  // Extract numeric portion and suffix (e.g. "150+" → 150, "+")
  const { numericValue, prefix, suffix } = parseStatValue(stat.value)
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 })
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isInView && numericValue !== null) {
      const timeout = setTimeout(() => {
        motionVal.set(numericValue)
      }, delay * 1000)
      return () => clearTimeout(timeout)
    }
  }, [isInView, numericValue, motionVal, delay])

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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.33, 1, 0.68, 1] as const }}
    >
      <div className="font-display text-4xl md:text-5xl text-foreground tabular-nums">
        {numericValue !== null ? (
          <span ref={displayRef}>{`${prefix}0${suffix}`}</span>
        ) : (
          stat.value
        )}
      </div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
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
