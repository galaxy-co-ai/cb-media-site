'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import { SectionHeader } from './SectionHeader'
import type { Section } from '@/sanity/lib/types'
import type { PortableTextBlock } from 'next-sanity'

interface WhoWeServeProps {
  section: Section
}

/** Base opacity for lines far from cursor during hover */
const BASE_OPACITY = 0.3
/** How many lines away before reaching base opacity */
const FALLOFF_LINES = 3
/** Resting opacity when cursor isn't over the section */
const REST_OPACITY = 0.5

function parseWords(blocks: PortableTextBlock[]): { word: string; isBold: boolean }[] {
  const words: { word: string; isBold: boolean }[] = []
  for (const block of blocks) {
    if (block._type !== 'block' || !block.children) continue
    for (const child of block.children as Array<{ text: string; marks?: string[] }>) {
      const isBold = child.marks?.includes('strong') ?? false
      const split = child.text.split(/\s+/).filter(Boolean)
      for (const w of split) {
        words.push({ word: w, isBold })
      }
    }
  }
  return words
}

export function WhoWeServe({ section }: WhoWeServeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const linesRef = useRef<{ top: number; els: HTMLSpanElement[] }[]>([])
  const lineHeightRef = useRef(60)
  const rafRef = useRef(0)
  const prefersReduced = useReducedMotion()

  const words = parseWords(section.content)

  // Group non-bold word spans into visual lines by offsetTop
  const buildLines = useCallback(() => {
    if (!textRef.current) return
    const lineMap = new Map<number, HTMLSpanElement[]>()
    textRef.current.querySelectorAll<HTMLSpanElement>('.word-dim').forEach((el) => {
      const top = Math.round(el.offsetTop / 4) * 4
      if (!lineMap.has(top)) lineMap.set(top, [])
      lineMap.get(top)!.push(el)
    })
    const sorted = Array.from(lineMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([top, els]) => ({ top, els }))
    linesRef.current = sorted
    if (sorted.length >= 2) {
      lineHeightRef.current = sorted[1].top - sorted[0].top
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(buildLines, 150)
    window.addEventListener('resize', buildLines)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', buildLines)
    }
  }, [buildLines, words.length])

  // Cursor-proximity spotlight (desktop only)
  useEffect(() => {
    if (prefersReduced) return
    if (!window.matchMedia('(min-width: 768px)').matches) return

    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    const setAllOpacity = (opacity: number) => {
      for (const line of linesRef.current) {
        for (const el of line.els) {
          el.style.opacity = String(opacity)
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const lines = linesRef.current
        if (lines.length === 0) return

        const textRect = textEl.getBoundingClientRect()
        const cursorY = e.clientY - textRect.top
        const lh = lineHeightRef.current

        for (const line of lines) {
          const lineCenter = line.top + lh / 2
          const dist = Math.abs(cursorY - lineCenter) / lh
          const t = Math.max(0, 1 - dist / FALLOFF_LINES)
          const opacity = BASE_OPACITY + (1 - BASE_OPACITY) * t
          for (const el of line.els) {
            el.style.opacity = String(opacity)
          }
        }
      })
    }

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafRef.current)
      setAllOpacity(REST_OPACITY)
    }

    // Start at resting state
    setAllOpacity(REST_OPACITY)

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [prefersReduced])

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-28 px-6 md:px-10 lg:px-16"
    >
      <SectionHeader title={section.title} />

      <div className="mt-8 md:mt-12 max-w-5xl">
        <p
          ref={textRef}
          className="font-display text-xl md:text-3xl lg:text-4xl leading-snug tracking-wide"
        >
          {words.map((w, i) => {
            if (w.isBold) {
              return (
                <span
                  key={i}
                  className="word-bold inline-block mr-[0.3em] font-semibold text-foreground"
                >
                  {w.word}
                </span>
              )
            }
            return (
              <span
                key={i}
                className="word-dim inline-block mr-[0.3em] text-foreground"
                style={{
                  opacity: prefersReduced ? 1 : REST_OPACITY,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {w.word}
              </span>
            )
          })}
        </p>
      </div>
    </section>
  )
}
