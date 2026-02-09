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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
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
          whileHover={{
            y: -2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: { type: 'spring', stiffness: 300, damping: 25 },
          }}
          className="group relative p-6 md:p-8 border border-white/[0.06] bg-background/40 backdrop-blur-[8px] rounded-sm hover:border-foreground/30 transition-colors duration-300"
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-sm" />
          </div>

          <div className="relative z-10">
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
