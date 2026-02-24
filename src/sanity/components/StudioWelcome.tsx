import { useEffect, useState } from 'react'
import { Stack, Text, Heading, Flex, Grid } from '@sanity/ui'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'

/* ── Tokens ── */
const GOLD = '#E8C872'
const GOLD_DIM = '#b8952e'
const TEXT = '#E8E4DE'
const MUTED = '#6B6560'
const SURFACE = '#1A1918'
const BORDER = 'rgba(255,255,255,0.08)'
const HOVER_BG = 'rgba(232,200,114,0.04)'

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

/* ── Styles ── */
const cardStyle: React.CSSProperties = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderLeft: `2px solid ${GOLD}`,
  borderRadius: 6,
}

const actionCardBase: React.CSSProperties = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'background-color 150ms ease, transform 150ms ease',
}

/* ── Component ── */
export function StudioWelcome() {
  const router = useRouter()
  const stats = useContentStats()
  const [hoveredAction, setHoveredAction] = useState<number | null>(null)

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: '100%', padding: '2rem', backgroundColor: '#111010' }}
    >
      <Stack space={5} style={{ maxWidth: 580, width: '100%' }}>
        {/* ── Header ── */}
        <Stack space={3}>
          <Heading
            size={4}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: TEXT,
            }}
          >
            <span style={{ color: GOLD }}>CB MEDIA</span>{' '}
            Content Studio
          </Heading>
          <div style={{ width: 64, height: 2, backgroundColor: GOLD, borderRadius: 1 }} />
          <Flex align="center" justify="space-between">
            <Text size={1} style={{ color: MUTED }}>
              Your site at a glance
            </Text>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: MUTED,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: '"Space Grotesk", sans-serif',
                letterSpacing: '0.02em',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = GOLD }}
              onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
            >
              View live site ↗
            </a>
          </Flex>
        </Stack>

        {/* ── Stats ── */}
        <Grid columns={stats.draftCount > 0 ? 4 : 3} gap={3}>
          <div style={cardStyle}>
            <div style={{ padding: '16px 16px 16px 14px' }}>
              <Text
                size={0}
                style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
              >
                Published
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text
                  size={4}
                  weight="bold"
                  style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {stats.sectionCount}
                </Text>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ padding: '16px 16px 16px 14px' }}>
              <Text
                size={0}
                style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
              >
                Hidden
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text
                  size={4}
                  weight="bold"
                  style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {stats.hiddenCount}
                </Text>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ padding: '16px 16px 16px 14px' }}>
              <Text
                size={0}
                style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
              >
                Last edit
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text
                  size={4}
                  weight="bold"
                  style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif', fontSize: stats.lastEdited ? 18 : undefined }}
                >
                  {formatTimeAgo(stats.lastEdited)}
                </Text>
              </div>
            </div>
          </div>

          {stats.draftCount > 0 && (
            <div style={{ ...cardStyle, borderLeftColor: '#c9960c' }}>
              <div style={{ padding: '16px 16px 16px 14px' }}>
                <Text
                  size={0}
                  style={{ color: '#c9960c', letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11 }}
                >
                  Drafts
                </Text>
                <div style={{ marginTop: 6 }}>
                  <Text
                    size={4}
                    weight="bold"
                    style={{ color: TEXT, fontVariantNumeric: 'tabular-nums', fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {stats.draftCount}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Grid>

        {/* ── Draft warning ── */}
        {stats.draftCount > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(201,150,12,0.06)',
              border: '1px solid rgba(201,150,12,0.15)',
              borderLeft: '2px solid #c9960c',
              borderRadius: 6,
              padding: '12px 16px 12px 14px',
            }}
          >
            <Text size={1} style={{ color: '#c9960c' }}>
              {stats.draftCount} unpublished {stats.draftCount === 1 ? 'draft' : 'drafts'} — publish when ready
            </Text>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <Stack space={3}>
          <Text
            size={0}
            style={{ color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontSize: 11, fontWeight: 600 }}
          >
            Quick actions
          </Text>
          <Stack space={2}>
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
                <Flex align="center" gap={3} style={{ padding: '16px' }}>
                  <Text size={2} style={{ color: GOLD, fontFamily: 'serif' }}>{action.icon}</Text>
                  <Stack space={1} style={{ flex: 1 }}>
                    <Text size={1} weight="semibold" style={{ color: TEXT }}>{action.title}</Text>
                    <Text size={1} style={{ color: MUTED }}>{action.description}</Text>
                  </Stack>
                  <Text size={1} style={{ color: MUTED }}>→</Text>
                </Flex>
              </div>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Flex>
  )
}
