'use client'

import { useEffect, useRef, useCallback } from 'react'
import { citySkylines, type Building } from './skylineData'

// Animation timing constants
const HOLD_DURATION = 6000 // ms to hold on each city
const MORPH_DURATION = 3000 // ms to transition between cities
const GRID_SPACING = 40 // px

// Visual constants
const GRID_OPACITY = 0.045
const BUILDING_LINE_OPACITY = 0.1
const WINDOW_OPACITY_MIN = 0.08
const WINDOW_OPACITY_MAX = 0.25
const HORIZON_GLOW_OPACITY = 0.02
const LABEL_OPACITY = 0.2

interface WindowLight {
  buildingIndex: number
  row: number
  col: number
  warmth: number // 0 = cool white, 1 = warm white
  phase: number
  speed: number
  isOn: boolean
}

// Easing function for smooth transitions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Interpolate between two building arrays
function interpolateBuildings(
  from: Building[],
  to: Building[],
  progress: number
): Building[] {
  const easedProgress = easeInOutCubic(progress)
  return from.map((fromBuilding, i) => {
    const toBuilding = to[i]
    return {
      x: lerp(fromBuilding.x, toBuilding.x, easedProgress),
      width: lerp(fromBuilding.width, toBuilding.width, easedProgress),
      height: lerp(fromBuilding.height, toBuilding.height, easedProgress),
      antennaHeight: lerp(
        fromBuilding.antennaHeight || 0,
        toBuilding.antennaHeight || 0,
        easedProgress
      ),
    }
  })
}

export function GridSkylineBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const stateRef = useRef({
    currentCityIndex: 0,
    nextCityIndex: 1,
    cycleStartTime: 0,
    scanLineY: 0,
    windowLights: [] as WindowLight[],
    reducedMotion: false,
    lastLabelOpacity: LABEL_OPACITY,
    // P9: Cursor proximity tracking
    mouseX: -1000,
    mouseY: -1000,
    smoothMouseX: -1000,
    smoothMouseY: -1000,
  })

  // Initialize window lights for a city
  const initWindowLights = useCallback((buildingCount: number): WindowLight[] => {
    const lights: WindowLight[] = []
    for (let b = 0; b < buildingCount; b++) {
      // Random number of windows per building
      const rows = Math.floor(Math.random() * 6) + 3
      const cols = Math.floor(Math.random() * 3) + 2
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() > 0.4) {
            // 60% chance of having a window
            lights.push({
              buildingIndex: b,
              row,
              col,
              warmth: Math.random(),
              phase: Math.random() * Math.PI * 2,
              speed: 0.15 + Math.random() * 0.5, // Slower, more subtle flicker
              isOn: Math.random() > 0.3,
            })
          }
        }
      }
    }
    return lights
  }, [])

  // Main render function
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = stateRef.current
    const { width, height } = canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const logicalWidth = width / dpr
    const logicalHeight = height / dpr

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // P9: Smooth lerp cursor position (0.1 factor per frame)
    state.smoothMouseX = lerp(state.smoothMouseX, state.mouseX, 0.1)
    state.smoothMouseY = lerp(state.smoothMouseY, state.mouseY, 0.1)

    // Initialize cycle time
    if (state.cycleStartTime === 0) {
      state.cycleStartTime = timestamp
      state.windowLights = initWindowLights(citySkylines[0].buildings.length)
    }

    // Calculate cycle progress
    const cycleTime = timestamp - state.cycleStartTime
    const totalCycleDuration = HOLD_DURATION + MORPH_DURATION
    const cycleProgress = cycleTime % totalCycleDuration
    const isMorphing = cycleProgress > HOLD_DURATION && !state.reducedMotion
    const morphProgress = isMorphing
      ? (cycleProgress - HOLD_DURATION) / MORPH_DURATION
      : 0

    // Update city indices when morph completes
    if (cycleProgress < 100 && cycleTime > totalCycleDuration && !state.reducedMotion) {
      state.currentCityIndex = state.nextCityIndex
      state.nextCityIndex = (state.nextCityIndex + 1) % citySkylines.length
      state.cycleStartTime = timestamp
    }

    // Get current buildings
    const currentCity = citySkylines[state.currentCityIndex]
    const nextCity = citySkylines[state.nextCityIndex]
    const buildings = isMorphing
      ? interpolateBuildings(currentCity.buildings, nextCity.buildings, morphProgress)
      : currentCity.buildings

    // Scale context for retina
    ctx.save()
    ctx.scale(dpr, dpr)

    // ===== Layer 1: Base Grid =====
    ctx.strokeStyle = `rgba(255, 255, 255, ${GRID_OPACITY})`
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= logicalWidth; x += GRID_SPACING) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, logicalHeight)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= logicalHeight; y += GRID_SPACING) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(logicalWidth, y)
      ctx.stroke()
    }

    // ===== Layer 2: City Skyline (emerging from grid) =====
    const buildingBaseY = logicalHeight

    buildings.forEach((building, index) => {
      if (building.height <= 0 || building.width <= 0) return

      const bx = (building.x / 100) * logicalWidth
      const bw = (building.width / 100) * logicalWidth
      const bh = (building.height / 100) * logicalHeight
      const by = buildingBaseY - bh

      // Building outline (slightly brighter than grid)
      ctx.strokeStyle = `rgba(255, 255, 255, ${BUILDING_LINE_OPACITY})`
      ctx.lineWidth = 1
      ctx.strokeRect(bx, by, bw, bh)

      // Floor lines (horizontal, aligned to grid)
      const floorHeight = GRID_SPACING
      const numFloors = Math.floor(bh / floorHeight)
      ctx.strokeStyle = `rgba(255, 255, 255, ${BUILDING_LINE_OPACITY * 0.6})`
      for (let f = 1; f < numFloors; f++) {
        const floorY = by + f * floorHeight
        ctx.beginPath()
        ctx.moveTo(bx, floorY)
        ctx.lineTo(bx + bw, floorY)
        ctx.stroke()
      }

      // Vertical window column lines
      const colWidth = bw / 3
      for (let c = 1; c < 3; c++) {
        ctx.beginPath()
        ctx.moveTo(bx + c * colWidth, by)
        ctx.lineTo(bx + c * colWidth, buildingBaseY)
        ctx.stroke()
      }

      // Antenna with blinking light
      if (building.antennaHeight && building.antennaHeight > 0) {
        const antennaHeight = (building.antennaHeight / 100) * logicalHeight
        const antennaCenterX = bx + bw / 2
        const antennaTopY = by - antennaHeight

        // Antenna pole
        ctx.strokeStyle = `rgba(255, 255, 255, ${BUILDING_LINE_OPACITY})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(antennaCenterX, by)
        ctx.lineTo(antennaCenterX, antennaTopY)
        ctx.stroke()

        // Blinking red light at top
        const blinkPhase = Math.sin(timestamp * 0.003 + index) > 0.3
        if (blinkPhase) {
          ctx.fillStyle = 'rgba(255, 60, 60, 0.8)'
          ctx.beginPath()
          ctx.arc(antennaCenterX, antennaTopY, 2, 0, Math.PI * 2)
          ctx.fill()

          // Glow
          const gradient = ctx.createRadialGradient(
            antennaCenterX,
            antennaTopY,
            0,
            antennaCenterX,
            antennaTopY,
            8
          )
          gradient.addColorStop(0, 'rgba(255, 60, 60, 0.4)')
          gradient.addColorStop(1, 'rgba(255, 60, 60, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(antennaCenterX, antennaTopY, 8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Window lights (only render if not in reduced motion or static)
      if (!state.reducedMotion || cycleTime < 100) {
        const relevantLights = state.windowLights.filter(
          (w) => w.buildingIndex === index
        )
        relevantLights.forEach((light) => {
          // Flicker logic - slower, more gradual transitions
          const flickerValue =
            Math.sin(timestamp * 0.0004 * light.speed + light.phase) * 0.5 + 0.5
          if (flickerValue < 0.15 && light.isOn) {
            light.isOn = Math.random() > 0.05 // Less likely to turn off
          } else if (flickerValue > 0.85 && !light.isOn) {
            light.isOn = Math.random() > 0.4 // Less likely to turn on
          }

          if (!light.isOn) return

          const windowWidth = bw / 4
          const windowHeight = floorHeight * 0.6
          const wx = bx + windowWidth * 0.5 + light.col * windowWidth
          const wy = by + floorHeight * 0.2 + light.row * floorHeight

          // Skip if window is outside building
          if (wy + windowHeight > buildingBaseY || wy < by) return
          if (wx + windowWidth > bx + bw) return

          // P9: Proximity boost — windows within 200px of cursor get 2x opacity
          const windowCenterX = wx + windowWidth * 0.35
          const windowCenterY = wy + windowHeight * 0.5
          const dx = windowCenterX - state.smoothMouseX
          const dy = windowCenterY - state.smoothMouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const proximityBoost = dist < 200 ? lerp(2, 1, dist / 200) : 1

          const opacity = lerp(WINDOW_OPACITY_MIN, WINDOW_OPACITY_MAX, flickerValue) * proximityBoost

          // Warm vs cool white
          const r = 255
          const g = Math.floor(lerp(240, 255, light.warmth))
          const b = Math.floor(lerp(200, 255, 1 - light.warmth))

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
          ctx.fillRect(wx, wy, windowWidth * 0.7, windowHeight)
        })
      }
    })

    // Horizon glow
    const horizonGradient = ctx.createLinearGradient(0, logicalHeight - 50, 0, logicalHeight)
    horizonGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    horizonGradient.addColorStop(1, `rgba(255, 255, 255, ${HORIZON_GLOW_OPACITY})`)
    ctx.fillStyle = horizonGradient
    ctx.fillRect(0, logicalHeight - 50, logicalWidth, 50)

    // ===== Layer 4: City Label =====
    const labelOpacity = isMorphing
      ? LABEL_OPACITY * (1 - Math.abs(morphProgress - 0.5) * 2)
      : LABEL_OPACITY

    const displayCityName = morphProgress > 0.5 ? nextCity.name : currentCity.name

    ctx.font = '11px system-ui, -apple-system, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillStyle = `rgba(255, 255, 255, ${labelOpacity})`
    ctx.textAlign = 'right'
    ctx.fillText(displayCityName, logicalWidth - 24, logicalHeight - 24)

    ctx.restore()

    // Continue animation loop
    if (!state.reducedMotion) {
      animationRef.current = requestAnimationFrame(render)
    }
  }, [initWindowLights])

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }, [])

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    stateRef.current.reducedMotion = prefersReducedMotion.matches

    const handleMotionChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches
      if (!e.matches) {
        // Restart animation if motion is re-enabled
        animationRef.current = requestAnimationFrame(render)
      }
    }

    prefersReducedMotion.addEventListener('change', handleMotionChange)

    // P9: Track mouse for cursor proximity
    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.mouseX = e.clientX
      stateRef.current.mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Initialize
    handleResize()
    window.addEventListener('resize', handleResize)

    // Start animation
    stateRef.current.windowLights = initWindowLights(citySkylines[0].buildings.length)
    animationRef.current = requestAnimationFrame(render)

    // If reduced motion, render once statically
    if (stateRef.current.reducedMotion) {
      render(0)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      prefersReducedMotion.removeEventListener('change', handleMotionChange)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [handleResize, render, initWindowLights])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-background"
      aria-hidden="true"
    />
  )
}
