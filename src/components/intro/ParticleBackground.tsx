'use client'

import { useCallback, useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, ISourceOptions } from '@tsparticles/engine'

export function ParticleBackground() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesOptions: ISourceOptions = {
    fullScreen: false,
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
      },
      modes: {
        grab: {
          distance: 120,
          links: {
            opacity: 0.3,
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
        distance: 180,
        enable: true,
        opacity: 0.08,
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'out',
        },
        random: true,
        speed: 0.3,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 1920,
          height: 1080,
        },
        value: 60,
      },
      opacity: {
        value: { min: 0.1, max: 0.4 },
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    detectRetina: true,
  }

  if (!init) return null

  return (
    <Particles
      id="particle-background"
      className="fixed inset-0 -z-10"
      options={particlesOptions}
    />
  )
}
