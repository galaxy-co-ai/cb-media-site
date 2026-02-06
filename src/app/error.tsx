'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <h1 className="font-display text-6xl md:text-8xl tracking-wider text-foreground mb-4">
        ERROR
      </h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
        Something went wrong. We apologize for the inconvenience.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-display text-xl tracking-wide"
      >
        TRY AGAIN
      </button>
    </div>
  )
}
