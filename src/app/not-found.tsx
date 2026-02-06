import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <h1 className="font-display text-6xl md:text-8xl tracking-wider text-foreground mb-4">
        404
      </h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-display text-xl tracking-wide"
      >
        BACK HOME
      </Link>
    </div>
  )
}
