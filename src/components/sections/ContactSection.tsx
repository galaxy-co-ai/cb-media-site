'use client'

import { useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '@/components/ui/MagneticButton'
import type { Section, SiteSettings } from '@/sanity/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface ContactSectionProps {
  section: Section
  siteSettings?: SiteSettings
}

export function ContactSection({ siteSettings }: ContactSectionProps) {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const prefersReduced = useReducedMotion()

  const email = siteSettings?.contactEmail || 'info@cb.media'
  const regionPhones = siteSettings?.regionPhones?.length
    ? siteSettings.regionPhones
    : [
        { region: 'NA', phone: '+1 (000) 000-0000' },
        { region: 'MENA', phone: '+971 0 000 0000' },
        { region: 'APAC', phone: '+61 0 0000 0000' },
      ]
  const ctaText = siteSettings?.ctaText || 'GET IN TOUCH'
  const ctaLink = siteSettings?.ctaLink || `mailto:${email}`

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
      <h2
        ref={headlineRef}
        className="font-display text-[clamp(2.25rem,10vw,7.5rem)] text-center leading-none tracking-[0.08em]"
      >
        LET&apos;S TALK
      </h2>

      <div className="mt-10 hidden md:block">
        <MagneticButton>
          <motion.a
            href={ctaLink}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-block px-10 py-4 border border-foreground text-foreground font-display text-lg tracking-wider transition-all duration-200 hover:bg-foreground hover:text-background hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          >
            {ctaText}
          </motion.a>
        </MagneticButton>
      </div>

      <div className="mt-8 md:hidden">
        <motion.a
          href={ctaLink}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="inline-block px-8 py-3 border border-foreground text-foreground font-display text-base tracking-wider transition-all duration-200 hover:bg-foreground hover:text-background"
        >
          {ctaText}
        </motion.a>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-muted-foreground">
        <a
          href={`mailto:${email}`}
          className="text-foreground hover:text-muted-foreground transition-colors"
        >
          {email}
        </a>
        {regionPhones.map(({ region, phone }, i) => (
          <div key={region} className="flex items-center gap-2">
            {i === 0 && <span className="hidden md:block text-border">|</span>}
            <span className="text-muted-foreground text-xs uppercase tracking-wider">{region}</span>
            <a
              href={`tel:${phone.replace(/[\s()-]/g, '')}`}
              className="text-sm hover:text-foreground transition-colors"
            >
              {phone}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
