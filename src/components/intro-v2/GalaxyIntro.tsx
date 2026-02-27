'use client'

import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { GalaxyScene } from './GalaxyScene'
import { detectQuality, type QualityConfig, getQualityConfig } from './quality'
import { createAnimState } from './types'

export default function GalaxyIntro() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const animState = useRef(createAnimState()).current
  const mouseRef = useRef({ x: 0, y: 0 })

  // DOM refs for HTML text overlay
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  const [quality, setQuality] = useState<QualityConfig | null>(null)

  // Detect GPU tier
  useEffect(() => {
    detectQuality().then(setQuality)
  }, [])

  // Reduced motion check
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setQuality(getQualityConfig(0))
    }
  }, [])

  // Track mouse position (normalized -1 to 1)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // rAF loop: sync HTML text overlay from mutable animState
  useEffect(() => {
    let rafId: number
    const tick = () => {
      const headline = headlineRef.current
      const tagline = taglineRef.current
      if (headline) {
        headline.style.opacity = String(animState.textOpacity)
      }
      if (tagline) {
        tagline.style.opacity = String(animState.taglineOpacity)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [animState])

  const handleAutoplayComplete = useCallback(() => {
    // Intro done — placeholder for future scroll integration
  }, [])

  // Tier 0 fallback: static text
  if (quality?.fallback) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0806',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: 'clamp(2rem, 8vw, 5rem)',
          letterSpacing: '0.08em',
          color: '#fff',
        }}>
          CB.MEDIA
        </h1>
      </div>
    )
  }

  // Loading while GPU detection runs
  if (!quality) {
    return <div style={{ minHeight: '100vh', background: '#0a0806' }} />
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fixed Canvas */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
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
            <GalaxyScene
              quality={quality}
              timelineRef={timelineRef}
              animState={animState}
              mouseRef={mouseRef}
              onAutoplayComplete={handleAutoplayComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Brand text overlay — HTML for reliable rendering */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <h1
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-display, "Montserrat", sans-serif)',
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#fff',
            opacity: 0,
            margin: 0,
            textTransform: 'uppercase',
            willChange: 'opacity',
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
            willChange: 'opacity',
          }}
        >
          TURNING VISIBILITY INTO VALUE
        </p>
      </div>

      {/* Scroll spacer for testing — content would go here in production */}
      <div style={{ position: 'relative', zIndex: 0, height: '100vh' }} />
    </div>
  )
}
