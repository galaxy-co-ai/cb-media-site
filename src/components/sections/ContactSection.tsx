'use client'

import { useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '@/components/ui/MagneticButton'
import type { Section } from '@/sanity/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface ContactSectionProps {
  section: Section
}

export function ContactSection({ section }: ContactSectionProps) {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced || !headlineRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(headlineRef.current!, {
        y: 60,
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headlineRef.current!,
          start: 'top 80%',
          once: true,
        },
      })
    })

    return () => ctx.revert()
  }, [prefersReduced])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 py-16">
      {/* Giant headline */}
      <h2
        ref={headlineRef}
        className="font-hero text-[clamp(2.25rem,10vw,7.5rem)] text-center leading-none"
      >
        LET&apos;S TALK
      </h2>

      <div className="mt-10 hidden md:block">
        <MagneticButton>
          <motion.a
            href="mailto:info@cb.media"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-block px-10 py-4 border border-foreground text-foreground font-display text-lg tracking-wider transition-all duration-200 hover:bg-foreground hover:text-background hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          >
            GET IN TOUCH
          </motion.a>
        </MagneticButton>
      </div>

      <div className="mt-8 md:hidden">
        <motion.a
          href="mailto:info@cb.media"
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="inline-block px-8 py-3 border border-foreground text-foreground font-display text-base tracking-wider transition-all duration-200 hover:bg-foreground hover:text-background"
        >
          GET IN TOUCH
        </motion.a>
      </div>

      {/* Contact details */}
      <div className="mt-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-muted-foreground">
        <a
          href="mailto:info@cb.media"
          className="text-foreground hover:text-muted-foreground transition-colors"
        >
          info@cb.media
        </a>
        <span className="hidden md:block text-border">|</span>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">NA</span>
            <a href="tel:+10000000000" className="hover:text-foreground transition-colors">
              +1 (000) 000-0000
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">EMEA</span>
            <a href="tel:+440000000000" className="hover:text-foreground transition-colors">
              +44 00 0000 0000
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">APAC</span>
            <a href="tel:+610000000000" className="hover:text-foreground transition-colors">
              +61 0 0000 0000
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
