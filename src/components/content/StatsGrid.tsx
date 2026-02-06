import type { Stat } from '@/sanity/lib/types'

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  if (!stats || stats.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      {stats.map((stat, index) => (
        <div key={index}>
          <div className="font-display text-4xl md:text-5xl text-foreground">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
