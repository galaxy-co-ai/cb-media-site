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
            ease: [0.4, 0, 0.2, 1]
          }}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.2 }
          }}
          className="group relative p-6 md:p-8 border border-border/50 bg-background/30 backdrop-blur-sm rounded-sm hover:border-foreground/30 hover:bg-background/50 transition-colors duration-300"
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

            {/* CTA Button */}
            {item.ctaLink ? (
              <a
                href={item.ctaLink}
                className="inline-block px-5 py-2.5 border border-foreground/60 text-foreground text-sm font-medium tracking-wider uppercase hover:bg-foreground hover:text-background transition-all duration-200"
              >
                {item.ctaText}
              </a>
            ) : (
              <button
                className="px-5 py-2.5 border border-foreground/60 text-foreground text-sm font-medium tracking-wider uppercase hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer"
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
