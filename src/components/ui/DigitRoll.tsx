'use client'

import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface DigitRollProps {
  value: string // e.g. "+193%", "-57%", "+454M"
  className?: string
}

/**
 * Parse a stat value string into prefix, digits, and suffix.
 * "+193%" → { prefix: "+", digits: [1, 9, 3], suffix: "%" }
 * "-57%"  → { prefix: "-", digits: [5, 7], suffix: "%" }
 * "+454M" → { prefix: "+", digits: [4, 5, 4], suffix: "M" }
 */
function parseValue(value: string) {
  const match = value.match(/^([+\-]?)(\d+)(.*)$/)
  if (!match) return { prefix: '', digits: [], suffix: value }

  return {
    prefix: match[1],
    digits: match[2].split('').map(Number),
    suffix: match[3],
  }
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const DIGIT_HEIGHT = 1 // in em units

export function DigitRoll({ value, className = '' }: DigitRollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const prefersReduced = useReducedMotion()

  const { prefix, digits, suffix } = parseValue(value)

  // Reduced motion: show final number immediately
  if (prefersReduced) {
    return (
      <span className={`font-display tabular-nums ${className}`}>
        {value}
      </span>
    )
  }

  return (
    <span
      ref={ref}
      className={`font-display tabular-nums inline-flex items-baseline ${className}`}
    >
      {prefix && <span>{prefix}</span>}

      {digits.map((digit, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ height: `${DIGIT_HEIGHT}em`, lineHeight: `${DIGIT_HEIGHT}em` }}
        >
          <span
            className="inline-flex flex-col transition-transform"
            style={{
              transform: isInView
                ? `translateY(-${digit * DIGIT_HEIGHT}em)`
                : `translateY(0)`,
              transitionProperty: 'transform',
              transitionDuration: `${800 + i * 150}ms`,
              transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
              transitionDelay: `${i * 80}ms`,
            }}
          >
            {DIGITS.map((d) => (
              <span
                key={d}
                className="block text-center"
                style={{ height: `${DIGIT_HEIGHT}em`, lineHeight: `${DIGIT_HEIGHT}em` }}
                aria-hidden={d !== digit}
              >
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}

      {suffix && <span>{suffix}</span>}
    </span>
  )
}
