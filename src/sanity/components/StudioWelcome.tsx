import { useEffect, useState } from 'react'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'

/* ── Tokens ── */
const ACCENT = '#C4875A'
const TEXT = '#2C2825'
const MUTED = '#8A8279'
const SURFACE = '#FFFFFF'
const BG = '#F5F0EB'
const BORDER = 'rgba(0,0,0,0.08)'
const HOVER_BG = 'rgba(196,135,90,0.04)'
const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/* ── Types ── */
interface ContentStats {
  sectionCount: number
  hiddenCount: number
  draftCount: number
  lastEdited: string | null
}

/* ── Data hook ── */
function useContentStats() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [stats, setStats] = useState<ContentStats>({
    sectionCount: 0,
    hiddenCount: 0,
    draftCount: 0,
    lastEdited: null,
  })

  useEffect(() => {
    const query = `{
      "sectionCount": count(*[_type == "section" && !(_id in path("drafts.**"))]),
      "hiddenCount": count(*[_type == "section" && !(_id in path("drafts.**")) && isVisible != true]),
      "draftCount": count(*[_type == "section" && _id in path("drafts.**")]),
      "lastEdited": *[_type == "section"] | order(_updatedAt desc)[0]._updatedAt
    }`
    client.fetch(query).then((result: ContentStats) => setStats(result))
  }, [client])

  return stats
}

/* ── Helpers ── */
function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/* ── Quick Actions ── */
const QUICK_ACTIONS = [
  {
    icon: '◆',
    title: 'Edit homepage sections',
    description: 'Update what visitors see on your website',
    path: '/studio/structure/section',
  },
  {
    icon: '✦',
    title: 'Update hero & contact info',
    description: 'Change your headline, email, or call-to-action',
    path: '/studio/structure/siteSettings',
  },
]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-media-site.vercel.app'

/* ── Shared styles ── */
const overline: React.CSSProperties = {
  color: MUTED,
  fontSize: 11,
  fontWeight: 600,
  fontFamily: FONT_UI,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: 0,
}

const statValue: React.CSSProperties = {
  color: TEXT,
  fontSize: 28,
  fontWeight: 700,
  fontFamily: FONT_UI,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.1,
  margin: 0,
}

const cardStyle: React.CSSProperties = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderLeft: `2px solid ${ACCENT}`,
  borderRadius: 6,
  padding: '16px 16px 16px 14px',
}

const actionCardBase: React.CSSProperties = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'background-color 150ms ease, transform 150ms ease',
  padding: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

/* ── Component ── */
export function StudioWelcome() {
  const router = useRouter()
  const stats = useContentStats()
  const [hoveredAction, setHoveredAction] = useState<number | null>(null)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: BG,
      }}
    >
      <div style={{ maxWidth: 580, width: '100%' }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: FONT_UI,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: '0.08em',
              color: TEXT,
              margin: 0,
            }}
          >
            <span style={{ color: ACCENT }}>CB MEDIA</span>{' '}
            Content Studio
          </h2>
          <div style={{ width: 64, height: 2, backgroundColor: ACCENT, borderRadius: 1, marginTop: 12 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ color: MUTED, fontSize: 14, fontFamily: FONT_UI }}>
              Your site at a glance
            </span>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: MUTED,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: FONT_UI,
                letterSpacing: '0.02em',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
            >
              View live site ↗
            </a>
          </div>
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: stats.draftCount > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={cardStyle}>
            <p style={overline}>Published</p>
            <p style={{ ...statValue, marginTop: 6 }}>{stats.sectionCount}</p>
          </div>

          <div style={cardStyle}>
            <p style={overline}>Hidden</p>
            <p style={{ ...statValue, marginTop: 6 }}>{stats.hiddenCount}</p>
          </div>

          <div style={cardStyle}>
            <p style={overline}>Last edit</p>
            <p style={{ ...statValue, marginTop: 6, fontSize: 20 }}>
              {formatTimeAgo(stats.lastEdited)}
            </p>
          </div>

          {stats.draftCount > 0 && (
            <div style={{ ...cardStyle, borderLeftColor: '#C49A3C' }}>
              <p style={{ ...overline, color: '#C49A3C' }}>Drafts</p>
              <p style={{ ...statValue, marginTop: 6 }}>{stats.draftCount}</p>
            </div>
          )}
        </div>

        {/* ── Draft warning ── */}
        {stats.draftCount > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(201,150,12,0.06)',
              border: '1px solid rgba(201,150,12,0.15)',
              borderLeft: '2px solid #C49A3C',
              borderRadius: 6,
              padding: '12px 16px 12px 14px',
              marginBottom: 24,
            }}
          >
            <span style={{ color: '#C49A3C', fontSize: 14, fontFamily: FONT_UI }}>
              {stats.draftCount} unpublished {stats.draftCount === 1 ? 'draft' : 'drafts'} — publish when ready
            </span>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div>
          <p style={{ ...overline, marginBottom: 12 }}>Quick actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_ACTIONS.map((action, i) => (
              <div
                key={action.title}
                role="button"
                tabIndex={0}
                style={{
                  ...actionCardBase,
                  backgroundColor: hoveredAction === i ? HOVER_BG : SURFACE,
                  transform: hoveredAction === i ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}
                onClick={() => {
                  if (action.path) {
                    router.navigateUrl({ path: action.path })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (action.path) router.navigateUrl({ path: action.path })
                  }
                }}
              >
                <span style={{ color: ACCENT, fontSize: 18, fontFamily: 'serif', flexShrink: 0 }}>
                  {action.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: TEXT, fontSize: 14, fontWeight: 600, fontFamily: FONT_UI, margin: 0 }}>
                    {action.title}
                  </p>
                  <p style={{ color: MUTED, fontSize: 13, fontFamily: FONT_UI, margin: '2px 0 0' }}>
                    {action.description}
                  </p>
                </div>
                <span style={{ color: MUTED, fontSize: 14 }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
