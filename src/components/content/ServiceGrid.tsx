'use client'

import { motion } from 'framer-motion'

export interface ServiceItem {
  _key: string
  title: string
  description: string
  ctaText: string
  ctaLink?: string
}

interface ServiceGridProps {
  items: ServiceItem[]
}

export function ServiceGrid({ items }: ServiceGridProps) {
  if (!items || items.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-4xl">
      {items.map((item, index) => (
        <motion.div
          key={item._key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
          className="group relative p-6 md:p-8"
        >
          <div>
            {/* Title */}
            <h3 className="font-semibold text-lg md:text-xl text-foreground mb-3">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-base text-muted-foreground mb-5 leading-relaxed">
              {item.description}
            </p>

            {/* CTA Button — P5: accent hover */}
            {item.ctaLink ? (
              <a
                href={item.ctaLink}
                className="inline-block px-5 py-2.5 border border-foreground/60 text-foreground text-sm font-medium tracking-wider uppercase transition-all duration-150 hover:bg-[var(--accent-glow)] hover:border-[var(--accent-glow)] hover:text-background"
              >
                {item.ctaText}
              </a>
            ) : (
              <button
                className="px-5 py-2.5 border border-foreground/60 text-foreground text-sm font-medium tracking-wider uppercase transition-all duration-150 cursor-pointer hover:bg-[var(--accent-glow)] hover:border-[var(--accent-glow)] hover:text-background"
              >
                {item.ctaText}
              </button>
            )}
          </div>
        </motion.div>

      ))}
    </div>
  )
}
