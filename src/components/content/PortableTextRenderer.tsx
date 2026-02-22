'use client'

import { PortableText, type PortableTextComponents } from 'next-sanity'
import type { PortableTextBlock } from 'next-sanity'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[clamp(1.125rem,2vw,1.25rem)] text-muted-foreground mb-4 last:mb-0">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] text-foreground mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-display text-[clamp(1.25rem,2.5vw,1.5rem)] text-foreground mb-3">
        {children}
      </h4>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="space-y-2 text-[clamp(1rem,1.8vw,1.125rem)] text-muted-foreground mb-4 last:mb-0">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="space-y-2 text-[clamp(1rem,1.8vw,1.125rem)] text-muted-foreground list-decimal list-inside mb-4 last:mb-0">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>• {children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
}

interface PortableTextRendererProps {
  content: PortableTextBlock[]
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  if (!content || content.length === 0) {
    return null
  }

  return (
    <div className="max-w-3xl">
      <PortableText value={content} components={components} />
    </div>
  )
}
