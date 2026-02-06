'use client'

import { useCallback, useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, ISourceOptions } from '@tsparticles/engine'

interface ConstellationIntroProps {
  onComplete?: () => void
}

export function ConstellationIntro({ onComplete }: ConstellationIntroProps) {
  const [init, setInit] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  useEffect(() => {
    // Transition to hero after intro animation
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const particlesOptions: ISourceOptions = {
    fullScreen: false,
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.5,
          },
        },
      },
    },
    particles: {
      color: {
        value: '#ffffff',
      },
      links: {
        color: '#ffffff',
        distance: 150,
        enable: true,
        opacity: 0.15,
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'out',
        },
        random: true,
        speed: 0.8,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 1920,
          height: 1080,
        },
        value: 100,
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: true,
          speed: 0.5,
          sync: false,
        },
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  }

  if (!init) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-background transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Particles
        id="constellation-intro"
        className="absolute inset-0"
        options={particlesOptions}
      />

      {/* Centered logo during intro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider text-foreground">
            CB.MEDIA
          </h1>
        </div>
      </div>
    </div>
  )
}
