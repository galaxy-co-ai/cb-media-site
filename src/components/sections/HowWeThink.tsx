'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionHeader } from './SectionHeader'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import type { Section } from '@/sanity/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface HowWeThinkProps {
  section: Section
}

export function HowWeThink({ section }: HowWeThinkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })
  const cards = section.serviceItems || []

  useEffect(() => {
    if (prefersReduced || !cardsContainerRef.current || cards.length === 0) return

    const ctx = gsap.context(() => {
      // Only pin on desktop
      ScrollTrigger.matchMedia({
        '(min-width: 768px)': () => {
          const cardEls = cardsContainerRef.current!.querySelectorAll<HTMLDivElement>('.philosophy-card')

          cardEls.forEach((card, i) => {
            if (i === cardEls.length - 1) return // Last card doesn't need pinning effect

            ScrollTrigger.create({
              trigger: card,
              start: 'top 15%',
              end: 'bottom 15%',
              pin: true,
              pinSpacing: false,
              onUpdate: (self) => {
                // Scale down and dim as next card approaches
                const progress = self.progress
                gsap.set(card, {
                  scale: 1 - progress * 0.05,
                  opacity: 1 - progress * 0.3,
                })
              },
            })
          })
        },
      })
    }, cardsContainerRef)

    return () => ctx.revert()
  }, [prefersReduced, cards.length])

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <SectionHeader title={section.title} />

      {/* Intro text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8 mb-16 max-w-3xl text-muted-foreground"
      >
        <PortableTextRenderer content={section.content} />
      </motion.div>

      {/* Cards container */}
      <div ref={cardsContainerRef} className="space-y-6 md:space-y-0">
        {cards.map((card, i) => (
          <PhilosophyCard
            key={card._key}
            index={i}
            title={card.title}
            description={card.description}
            isInView={isInView}
            prefersReduced={!!prefersReduced}
          />
        ))}
      </div>
    </section>
  )
}

function PhilosophyCard({
  index,
  title,
  description,
  isInView,
  prefersReduced,
}: {
  index: number
  title: string
  description: string
  isInView: boolean
  prefersReduced: boolean
}) {
  return (
    <motion.div
      initial={prefersReduced ? undefined : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="philosophy-card bg-[oklch(0.08_0_0)] border border-border rounded-lg p-8 md:p-12 md:min-h-[300px] flex flex-col justify-center"
    >
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-display text-sm text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-display text-xl md:text-2xl lg:text-3xl tracking-wide text-foreground">
          {title}
        </h3>
      </div>
      <p className="text-muted-foreground leading-relaxed md:pl-10 max-w-2xl">
        {description}
      </p>
    </motion.div>
  )
}
