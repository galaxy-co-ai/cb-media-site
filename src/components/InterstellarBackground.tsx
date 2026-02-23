'use client'

import { useEffect, useRef, useCallback } from 'react'

// ── Star Field Configuration ──────────────────────────────────
const STAR_LAYERS = [
  { count: 20,  speedFactor: 0.04, sizeRange: [0.8, 1.5], opacityRange: [0.3, 0.6] },   // distant pinpricks
  { count: 8,   speedFactor: 0.15, sizeRange: [3.0, 6.0], opacityRange: [0.7, 1.0] },   // hero glossy spheres
]

const NEBULA_CLOUDS = [
  { x: 0.15, y: 0.3, radius: 0.25, color: [80, 40, 120], opacity: 0.015 },   // purple
  { x: 0.7, y: 0.6, radius: 0.3, color: [20, 50, 100], opacity: 0.012 },     // deep blue
  { x: 0.5, y: 0.15, radius: 0.2, color: [100, 30, 60], opacity: 0.01 },     // crimson
  { x: 0.85, y: 0.25, radius: 0.15, color: [30, 70, 90], opacity: 0.008 },   // teal
]

const SHOOTING_STAR_INTERVAL = 4000 // ms between shooting stars
const GRID_OPACITY = 0.03

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinklePhase: number
  twinkleSpeed: number
  layer: number
  // Glossy sphere properties
  aspect: number       // 0.75–1.0, how elliptical
  rotation: number     // radians, ellipse tilt
  hue: number          // slight color variation (cool white–blue range)
}

interface ShootingStar {
  x: number
  y: number
  angle: number
  speed: number
  length: number
  opacity: number
  life: number
  maxLife: number
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function InterstellarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const stateRef = useRef({
    stars: [] as Star[],
    shootingStars: [] as ShootingStar[],
    lastShootingStarTime: 0,
    mouseX: -1000,
    mouseY: -1000,
    smoothMouseX: -1000,
    smoothMouseY: -1000,
    reducedMotion: false,
    initialized: false,
    paused: false,
    bgGradient: null as CanvasGradient | null,
    bgDimensions: { w: 0, h: 0 },
  })

  const initStars = useCallback((width: number, height: number): Star[] => {
    const stars: Star[] = []
    STAR_LAYERS.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: lerp(layer.sizeRange[0], layer.sizeRange[1], Math.random()),
          opacity: lerp(layer.opacityRange[0], layer.opacityRange[1], Math.random()),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.15 + Math.random() * 0.4,
          layer: layerIndex,
          aspect: 0.75 + Math.random() * 0.25,
          rotation: Math.random() * Math.PI,
          hue: 210 + Math.random() * 30, // 210–240 range (cool blue–white)
        })
      }
    })
    return stars
  }, [])

  const spawnShootingStar = useCallback((width: number, height: number): ShootingStar => {
    const startEdge = Math.random()
    let x: number, y: number
    // Start from top or right edge
    if (startEdge < 0.6) {
      x = Math.random() * width
      y = -10
    } else {
      x = width + 10
      y = Math.random() * height * 0.5
    }
    const angle = Math.PI * 0.6 + Math.random() * 0.4 // roughly top-right to bottom-left
    return {
      x, y, angle,
      speed: 8 + Math.random() * 12,
      length: 60 + Math.random() * 100,
      opacity: 0.6 + Math.random() * 0.4,
      life: 0,
      maxLife: 40 + Math.random() * 30,
    }
  }, [])

  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = stateRef.current

    if (state.paused) {
      animationRef.current = requestAnimationFrame(render)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    // Initialize stars on first render
    if (!state.initialized) {
      state.stars = initStars(w, h)
      state.initialized = true
    }

    // Smooth cursor
    state.smoothMouseX = lerp(state.smoothMouseX, state.mouseX, 0.08)
    state.smoothMouseY = lerp(state.smoothMouseY, state.mouseY, 0.08)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)

    // ═══ Layer 0: Deep space gradient base (cached — only recreate on resize) ═══
    if (!state.bgGradient || state.bgDimensions.w !== w || state.bgDimensions.h !== h) {
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8)
      bgGrad.addColorStop(0, 'rgba(8, 8, 20, 1)')
      bgGrad.addColorStop(0.5, 'rgba(4, 4, 12, 1)')
      bgGrad.addColorStop(1, 'rgba(2, 2, 6, 1)')
      state.bgGradient = bgGrad
      state.bgDimensions = { w, h }
    }
    ctx.fillStyle = state.bgGradient
    ctx.fillRect(0, 0, w, h)

    // ═══ Layer 1: Nebula clouds ═══
    NEBULA_CLOUDS.forEach(cloud => {
      const cx = cloud.x * w
      const cy = cloud.y * h
      const r = cloud.radius * Math.max(w, h)
      const [cr, cg, cb] = cloud.color

      // Subtle breathing animation
      const breathe = Math.sin(timestamp * 0.0003 + cloud.x * 10) * 0.3 + 1
      const opacity = cloud.opacity * breathe

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${opacity})`)
      grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${opacity * 0.4})`)
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    })

    // ═══ Layer 2: Subtle grid (space coordinates feel) ═══
    const gridSpacing = 60
    ctx.strokeStyle = `rgba(255, 255, 255, ${GRID_OPACITY})`
    ctx.lineWidth = 0.5

    for (let x = 0; x <= w; x += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // ═══ Layer 3: Glossy star spheres with parallax + twinkle ═══
    const cursorOffsetX = (state.smoothMouseX - w / 2) / w
    const cursorOffsetY = (state.smoothMouseY - h / 2) / h

    state.stars.forEach(star => {
      const layer = STAR_LAYERS[star.layer]

      // Parallax offset based on cursor
      const px = star.x + cursorOffsetX * layer.speedFactor * -80
      const py = star.y + cursorOffsetY * layer.speedFactor * -80

      // Slow, gentle twinkle
      const twinkle = Math.sin(timestamp * 0.001 * star.twinkleSpeed + star.twinklePhase) * 0.15 + 0.85
      const finalOpacity = star.opacity * twinkle

      // Cursor proximity brightening
      const dx = px - state.smoothMouseX
      const dy = py - state.smoothMouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const proximityBoost = dist < 300 ? lerp(1.4, 1, dist / 300) : 1

      const adjustedOpacity = Math.min(finalOpacity * proximityBoost, 1)

      if (star.layer === 0) {
        // ── Distant: crisp pinpricks, no glow ──
        ctx.fillStyle = `rgba(220, 230, 255, ${adjustedOpacity})`
        ctx.beginPath()
        ctx.arc(px, py, star.size, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // ── Hero: glossy neumorphic spheres ──
        const r = star.size
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(star.rotation)

        // Body — subtly misshapen ellipse, vivid fill
        const bodyL = 70 + adjustedOpacity * 25 // lightness 70–95%
        ctx.fillStyle = `hsla(${star.hue}, 30%, ${bodyL}%, ${adjustedOpacity})`
        ctx.beginPath()
        ctx.ellipse(0, 0, r, r * star.aspect, 0, 0, Math.PI * 2)
        ctx.fill()

        // Specular highlight — hot white crescent, offset upper-left
        const hlR = r * 0.45
        const hlX = -r * 0.25
        const hlY = -r * 0.3
        ctx.fillStyle = `rgba(255, 255, 255, ${adjustedOpacity * 0.85})`
        ctx.beginPath()
        ctx.ellipse(hlX, hlY, hlR, hlR * 0.7, -0.4, 0, Math.PI * 2)
        ctx.fill()

        // Rim light — thin bright edge on the opposite side
        ctx.strokeStyle = `rgba(200, 220, 255, ${adjustedOpacity * 0.3})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 0.95, r * star.aspect * 0.95, 0, 0.8, 2.2)
        ctx.stroke()

        ctx.restore()
      }
    })

    // ═══ Layer 4: Shooting stars ═══
    if (timestamp - state.lastShootingStarTime > SHOOTING_STAR_INTERVAL) {
      if (Math.random() > 0.4) { // 60% chance each interval
        state.shootingStars.push(spawnShootingStar(w, h))
      }
      state.lastShootingStarTime = timestamp
    }

    state.shootingStars = state.shootingStars.filter(ss => {
      ss.life++
      ss.x += Math.cos(ss.angle) * ss.speed
      ss.y += Math.sin(ss.angle) * ss.speed

      const lifeProgress = ss.life / ss.maxLife
      const fadeIn = Math.min(lifeProgress * 4, 1)
      const fadeOut = 1 - Math.max((lifeProgress - 0.6) / 0.4, 0)
      const currentOpacity = ss.opacity * fadeIn * fadeOut

      if (currentOpacity <= 0) return false

      // Trail
      const tailX = ss.x - Math.cos(ss.angle) * ss.length * fadeIn
      const tailY = ss.y - Math.sin(ss.angle) * ss.length * fadeIn

      const trailGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y)
      trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
      trailGrad.addColorStop(0.7, `rgba(200, 220, 255, ${currentOpacity * 0.4})`)
      trailGrad.addColorStop(1, `rgba(255, 255, 255, ${currentOpacity})`)

      ctx.strokeStyle = trailGrad
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(ss.x, ss.y)
      ctx.stroke()

      // Head glow
      const headGrad = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 4)
      headGrad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`)
      headGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = headGrad
      ctx.beginPath()
      ctx.arc(ss.x, ss.y, 4, 0, Math.PI * 2)
      ctx.fill()

      return ss.life < ss.maxLife && ss.x > -100 && ss.y < h + 100
    })

    // ═══ Layer 5: Cursor light halo ═══
    if (state.smoothMouseX > 0 && state.smoothMouseY > 0) {
      const haloGrad = ctx.createRadialGradient(
        state.smoothMouseX, state.smoothMouseY, 0,
        state.smoothMouseX, state.smoothMouseY, 200
      )
      haloGrad.addColorStop(0, 'rgba(100, 120, 200, 0.03)')
      haloGrad.addColorStop(0.5, 'rgba(80, 100, 180, 0.015)')
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = haloGrad
      ctx.beginPath()
      ctx.arc(state.smoothMouseX, state.smoothMouseY, 200, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()

    if (!state.reducedMotion) {
      animationRef.current = requestAnimationFrame(render)
    }
  }, [initStars, spawnShootingStar])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    // Re-init stars and invalidate cached gradient for new dimensions
    stateRef.current.stars = initStars(window.innerWidth, window.innerHeight)
    stateRef.current.bgGradient = null
  }, [initStars])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    stateRef.current.reducedMotion = prefersReducedMotion.matches

    const handleMotionChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches
      if (!e.matches) animationRef.current = requestAnimationFrame(render)
    }
    prefersReducedMotion.addEventListener('change', handleMotionChange)

    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.mouseX = e.clientX
      stateRef.current.mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Pause when tab is hidden
    const handleVisibility = () => {
      stateRef.current.paused = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Pause when canvas is scrolled off-screen
    let observer: IntersectionObserver | null = null
    if (canvasRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          stateRef.current.paused = !entry.isIntersecting || document.hidden
        },
        { threshold: 0 },
      )
      observer.observe(canvasRef.current)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    animationRef.current = requestAnimationFrame(render)

    if (stateRef.current.reducedMotion) render(0)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      prefersReducedMotion.removeEventListener('change', handleMotionChange)
      observer?.disconnect()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [handleResize, render])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#020208' }}
      aria-hidden="true"
    />
  )
}
