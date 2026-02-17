'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * GridZoomIntro — Fundamental.co-inspired zoom-through intro
 * 
 * Sequence:
 * 1. Fine micro-grid (zooms in)
 * 2. Medium grid (zooms in)
 * 3. Macro grid with stars appearing through gaps
 * 4. Grid dissolves → flash of light
 * 5. CB MEDIA title reveals
 * 6. Fades out to main site
 */

interface GridZoomIntroProps {
  onComplete: () => void
  /** Skip intro (e.g. returning visitors) */
  skip?: boolean
}

// Phase durations in ms
const PHASES = {
  MICRO_GRID: 1200,
  MEDIUM_GRID: 1000,
  MACRO_GRID: 1000,
  FLASH: 400,
  TITLE_HOLD: 1800,
  FADE_OUT: 800,
} as const

type Phase = 'micro' | 'medium' | 'macro' | 'flash' | 'title' | 'fadeout' | 'done'

export function GridZoomIntro({ onComplete, skip = false }: GridZoomIntroProps) {
  const [phase, setPhase] = useState<Phase>('micro')
  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout[]>([])

  const clearTimeouts = useCallback(() => {
    timeoutRef.current.forEach(clearTimeout)
    timeoutRef.current = []
  }, [])

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timeoutRef.current.push(id)
    return id
  }, [])

  useEffect(() => {
    if (skip) {
      setVisible(false)
      onComplete()
      return
    }

    let elapsed = 0

    elapsed += PHASES.MICRO_GRID
    addTimeout(() => setPhase('medium'), elapsed)

    elapsed += PHASES.MEDIUM_GRID
    addTimeout(() => setPhase('macro'), elapsed)

    elapsed += PHASES.MACRO_GRID
    addTimeout(() => setPhase('flash'), elapsed)

    elapsed += PHASES.FLASH
    addTimeout(() => setPhase('title'), elapsed)

    elapsed += PHASES.TITLE_HOLD
    addTimeout(() => setPhase('fadeout'), elapsed)

    elapsed += PHASES.FADE_OUT
    addTimeout(() => {
      setVisible(false)
      onComplete()
    }, elapsed)

    return clearTimeouts
  }, [skip, onComplete, addTimeout, clearTimeouts])

  // Click to skip
  const handleSkip = useCallback(() => {
    clearTimeouts()
    setPhase('fadeout')
    setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 300)
  }, [clearTimeouts, onComplete])

  if (!visible) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
          style={{ background: '#020208' }}
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fadeout' ? 0 : 1 }}
          transition={{ duration: phase === 'fadeout' ? 0.8 : 0.3 }}
        >
          {/* Skip hint */}
          <motion.span
            className="absolute bottom-8 text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Click to skip
          </motion.span>

          {/* ═══ Micro Grid Phase ═══ */}
          {(phase === 'micro') && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: PHASES.MICRO_GRID / 1000, ease: [0.33, 1, 0.68, 1] }}
            >
              <GridPattern spacing={12} opacity={0.12} color="rgba(255,255,255," />
            </motion.div>
          )}

          {/* ═══ Medium Grid Phase ═══ */}
          {(phase === 'medium') && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: PHASES.MEDIUM_GRID / 1000, ease: [0.33, 1, 0.68, 1] }}
            >
              <GridPattern spacing={40} opacity={0.1} color="rgba(255,255,255," />
            </motion.div>
          )}

          {/* ═══ Macro Grid Phase (with emerging stars) ═══ */}
          {(phase === 'macro') && (
            <>
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: PHASES.MACRO_GRID / 1000, ease: [0.33, 1, 0.68, 1] }}
              >
                <GridPattern spacing={100} opacity={0.08} color="rgba(100,140,255," />
              </motion.div>

              {/* Stars emerging */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <StarBurst />
              </motion.div>
            </>
          )}

          {/* ═══ Flash Phase ═══ */}
          {phase === 'flash' && (
            <motion.div
              className="absolute inset-0"
              style={{ background: 'white' }}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: PHASES.FLASH / 1000, ease: 'easeOut' }}
            />
          )}

          {/* ═══ Title Phase ═══ */}
          {(phase === 'title' || phase === 'fadeout') && (
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Main title */}
              <motion.h1
                className="font-hero text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.12em]"
                initial={{ opacity: 0, scale: 1.2, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              >
                CB MEDIA
              </motion.h1>

              {/* Tagline */}
              <motion.p
                className="text-sm md:text-base tracking-[0.3em] uppercase"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                Turn Visibility Into Value
              </motion.p>

              {/* Horizontal accent line */}
              <motion.div
                className="h-px bg-white/20"
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
              />
            </div>
          )}

          {/* Persistent star dots during title phase */}
          {(phase === 'title' || phase === 'fadeout') && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1 }}
            >
              <StarBurst />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Grid Pattern SVG ──────────────────────────────────────────
function GridPattern({ spacing, opacity, color }: { spacing: number; opacity: number; color: string }) {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`grid-${spacing}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <path
            d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
            fill="none"
            stroke={`${color}${opacity})`}
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-${spacing})`} />
    </svg>
  )
}

// ── Star Burst (static dots for intro) ────────────────────────
function StarBurst() {
  const stars = useRef(
    Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.6,
      delay: Math.random() * 0.5,
    }))
  )

  return (
    <div className="absolute inset-0">
      {stars.current.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: `rgba(200, 220, 255, ${star.opacity})`,
            boxShadow: star.size > 1.5
              ? `0 0 ${star.size * 3}px rgba(150, 180, 255, ${star.opacity * 0.5})`
              : 'none',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: star.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
