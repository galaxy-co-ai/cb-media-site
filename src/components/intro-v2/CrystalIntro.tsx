'use client'

import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { CrystalScene } from './CrystalScene'
import { ScrollController } from './ScrollController'
import { detectQuality, type QualityConfig, getQualityConfig } from './quality'
import { createAnimState } from './types'

export default function CrystalIntro() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const scrollSpacerRef = useRef<HTMLDivElement>(null)
  const animState = useRef(createAnimState()).current

  // DOM refs for HTML text overlay (driven by rAF, not React state)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  const [quality, setQuality] = useState<QualityConfig | null>(null)
  const [showSkip, setShowSkip] = useState(false)
  const [autoplayDone, setAutoplayDone] = useState(false)
  const [skipped, setSkipped] = useState(false)

  // Detect GPU tier on mount
  useEffect(() => {
    detectQuality().then(setQuality)
  }, [])

  // Check reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setQuality(getQualityConfig(0)) // Fallback
      setAutoplayDone(true)
      return
    }
    // Show skip after 1.5s
    const timer = setTimeout(() => setShowSkip(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // rAF loop: sync HTML text overlay opacity/scale from mutable animState
  // Refs may be null initially (quality=null → early return), so check inside tick
  useEffect(() => {
    let rafId: number
    const tick = () => {
      const headline = headlineRef.current
      const tagline = taglineRef.current
      if (headline) {
        headline.style.opacity = String(animState.textOpacity)
        headline.style.transform = `scale(${1 + animState.scrollInfluence * 0.03})`
      }
      if (tagline) {
        tagline.style.opacity = String(animState.taglineOpacity)
        tagline.style.transform = `scale(${1 + animState.scrollInfluence * 0.03})`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [animState])

  const handleAutoplayComplete = useCallback(() => {
    setAutoplayDone(true)
  }, [])

  const handleSkip = useCallback(() => {
    if (!timelineRef.current || skipped) return
    setSkipped(true)
    // Jump to end of timeline
    gsap.to({}, {
      duration: 0.3,
      onUpdate() {
        if (timelineRef.current) {
          timelineRef.current.progress(
            gsap.utils.interpolate(
              timelineRef.current.progress(),
              1,
              this.progress(),
            ),
          )
        }
      },
      onComplete() {
        timelineRef.current?.progress(1)
      },
    })
  }, [skipped])

  // Fallback: static image (tier 0)
  if (quality?.fallback) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            letterSpacing: '0.08em',
            color: '#fff',
          }}
        >
          CB.MEDIA
        </h1>
      </div>
    )
  }

  // Loading state while detecting GPU
  if (!quality) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
        }}
      />
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Fixed Canvas — stays in viewport while content scrolls */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
        }}
      >
        <Canvas
          gl={{
            powerPreference: 'high-performance',
            antialias: false,
            stencil: false,
            alpha: false,
          }}
          dpr={quality.dpr}
          frameloop="always"
          flat
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <CrystalScene
              quality={quality}
              timelineRef={timelineRef}
              animState={animState}
              onAutoplayComplete={handleAutoplayComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Brand text overlay — HTML for reliable rendering (drei Text/troika hangs Suspense) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <h1
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 'clamp(2rem, 8vw, 4.5rem)',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: '#fff',
            opacity: 0,
            margin: 0,
            textTransform: 'uppercase',
            willChange: 'opacity, transform',
          }}
        >
          CB.MEDIA
        </h1>
        <p
          ref={taglineRef}
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 'clamp(0.55rem, 1.5vw, 0.85rem)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: 'rgba(255, 255, 255, 0.6)',
            opacity: 0,
            margin: 0,
            marginTop: '1rem',
            textTransform: 'uppercase',
            willChange: 'opacity, transform',
          }}
        >
          TURNING VISIBILITY INTO VALUE
        </p>
      </div>

      {/* Scroll spacer — provides scroll height for scroll-driven phase */}
      <div
        ref={scrollSpacerRef}
        style={{
          position: 'relative',
          zIndex: 0,
          height: '300vh',
          pointerEvents: autoplayDone ? 'auto' : 'none',
        }}
      >
        {/* First viewport: empty (canvas visible behind) */}
        <div style={{ height: '100vh' }} />

        {/* Remaining scroll: drives the shard spread + transition */}
        <div style={{ height: '200vh' }} />
      </div>

      {/* Skip button */}
      {showSkip && !skipped && !autoplayDone && (
        <button
          onClick={handleSkip}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display, sans-serif)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'color 0.2s, border-color 0.2s',
            zIndex: 60,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }}
        >
          Skip
        </button>
      )}

      {/* Scroll indicator */}
      {autoplayDone && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display, sans-serif)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          Scroll
        </div>
      )}

      {/* ScrollController — bridges scroll position to animState */}
      <ScrollController
        animState={animState}
        enabled={autoplayDone}
        triggerRef={scrollSpacerRef}
      />
    </div>
  )
}
