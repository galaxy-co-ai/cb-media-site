'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionHeader } from './SectionHeader'
import type { Section } from '@/sanity/lib/types'
import type { PortableTextBlock } from 'next-sanity'

gsap.registerPlugin(ScrollTrigger)

interface WhoWeServeProps {
  section: Section
}

/**
 * Extract plain text + bold markers from PortableText blocks.
 * Returns an array of { word, isBold } for each word.
 */
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
  const wordsRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  const words = parseWords(section.content)

  useEffect(() => {
    if (prefersReduced || !wordsRef.current) return

    const wordEls = wordsRef.current.querySelectorAll<HTMLSpanElement>('.word')
    if (wordEls.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: wordsRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
          },
        },
      )
    }, wordsRef)

    return () => ctx.revert()
  }, [prefersReduced, words.length])

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-40 px-6 md:px-12 lg:px-24"
    >
      <SectionHeader title={section.title} />

      <div
        ref={wordsRef}
        className="mt-12 md:mt-16 max-w-5xl"
      >
        <p className="font-display text-2xl md:text-4xl lg:text-5xl leading-snug tracking-wide">
          {words.map((w, i) => {
            // Bold words always stay bright
            if (w.isBold) {
              return (
                <span
                  key={i}
                  className="word inline-block mr-[0.3em] font-semibold text-foreground"
                  style={{ opacity: 1 }}
                >
                  {w.word}
                </span>
              )
            }

            return (
              <span
                key={i}
                className="word inline-block mr-[0.3em] text-foreground"
                style={prefersReduced ? undefined : { opacity: 0.15 }}
              >
                {w.word}
              </span>
            )
          })}
        </p>
      </div>

      {/* Mobile fallback: simple fade-in instead of scroll scrub */}
      <motion.div
        className="md:hidden mt-8"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      />
    </section>
  )
}
