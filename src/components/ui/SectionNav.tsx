'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'

interface SectionNavProps {
  /** Ordered list of section IDs (first should be 'hero') */
  sectionIds: string[]
  visible: boolean
}

export function SectionNav({ sectionIds, visible }: SectionNavProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { snap } = useSmoothScroll()

  // Track which section is in view via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id, index) => {
      const el = id === 'hero'
        ? document.querySelector<HTMLElement>('[data-snap-section]')
        : document.getElementById(id)

      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentIndex(index)
          }
        },
        { threshold: 0.4 },
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sectionIds])

  const goTo = useCallback(
    (index: number) => {
      if (snap) {
        snap.goTo(index)
      } else {
        // Fallback: native scroll to section
        const id = sectionIds[index]
        if (!id) return
        if (id === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
    [snap, sectionIds],
  )

  const goUp = useCallback(() => {
    if (snap) {
      snap.previous()
    } else if (currentIndex > 0) {
      goTo(currentIndex - 1)
    }
  }, [snap, currentIndex, goTo])

  const goDown = useCallback(() => {
    if (snap) {
      snap.next()
    } else if (currentIndex < sectionIds.length - 1) {
      goTo(currentIndex + 1)
    }
  }, [snap, currentIndex, sectionIds.length, goTo])

  const isFirst = currentIndex === 0
  const isLast = currentIndex === sectionIds.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[52] flex items-center gap-3"
          aria-label="Section navigation"
        >
          {/* Up chevron */}
          <button
            onClick={goUp}
            disabled={isFirst}
            className={`p-2 transition-colors duration-150 cursor-pointer ${
              isFirst
                ? 'text-muted-foreground/30 cursor-default'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Previous section"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {sectionIds.map((id, i) => (
              <button
                key={id}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  i === currentIndex
                    ? 'w-2 h-2 bg-foreground'
                    : 'w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground'
                }`}
                aria-label={`Go to ${id === 'hero' ? 'top' : id.replace(/-/g, ' ')}`}
              />
            ))}
          </div>

          {/* Down chevron */}
          <button
            onClick={goDown}
            disabled={isLast}
            className={`p-2 transition-colors duration-150 cursor-pointer ${
              isLast
                ? 'text-muted-foreground/30 cursor-default'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Next section"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
