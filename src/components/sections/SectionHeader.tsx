'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SectionHeaderProps {
  title: string
  className?: string
}

export function SectionHeader({ title, className = '' }: SectionHeaderProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)
  const prefersReduced = useReducedMotion()
  const hasAnimated = useRef(false)

  const splitAndAnimate = useCallback(() => {
    const el = containerRef.current
    if (!el || prefersReduced || hasAnimated.current) return

    // Split text into individual character spans
    const text = el.textContent || ''
    el.innerHTML = ''
    const chars: HTMLSpanElement[] = []

    for (const char of text) {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(40px)'
      el.appendChild(span)
      chars.push(span)
    }

    hasAnimated.current = true

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
    })
  }, [prefersReduced])

  useEffect(() => {
    splitAndAnimate()

    return () => {
      // Clean up ScrollTrigger instances for this element
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === containerRef.current)
        .forEach((st) => st.kill())
    }
  }, [splitAndAnimate])

  return (
    <h2
      ref={containerRef}
      className={`font-display text-4xl md:text-6xl lg:text-7xl tracking-wide text-foreground ${className}`}
    >
      {title}
    </h2>
  )
}
