import { useEffect, useState, useMemo } from 'react'
import { Card, Stack, Text, Heading, Flex, Button, Grid } from '@sanity/ui'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'

interface ContentStats {
  sectionCount: number
  hiddenCount: number
  draftCount: number
  lastEdited: string | null
}

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

const TIPS = [
  'Click any section in the sidebar to edit it',
  'Hit "Publish" to push changes live instantly',
  'Toggle "Show on Website" to hide a section without deleting',
  'Drag sections in "All Sections" to reorder them on the page',
  'Use the Preview tab to see your site while editing',
  'Upload images via the Media tool in the top nav',
  'Add social links in Hero & Branding → SEO & Social',
  'The AI sparkle icon on text fields can help draft copy',
]

const QUICK_ACTIONS = [
  {
    icon: '📄',
    title: 'Edit Homepage Sections',
    description: 'Update what visitors see on your website',
    path: '/studio/structure/section',
  },
  {
    icon: '✏️',
    title: 'Update Hero & Contact Info',
    description: 'Change your headline, email, or call-to-action',
    path: '/studio/structure/siteSettings',
  },
  {
    icon: '🌐',
    title: 'Preview Site',
    description: 'Open your live website in a new tab',
    href: process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-media-site.vercel.app',
    external: true,
  },
]

export function StudioWelcome() {
  const router = useRouter()
  const stats = useContentStats()

  const todayTip = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % TIPS.length
    return TIPS[dayIndex]
  }, [])

  return (
    <Flex align="center" justify="center" style={{ height: '100%', padding: '2rem' }}>
      <Stack space={5} style={{ maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <Stack space={2}>
          <Heading
            size={4}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
              borderBottom: '2px solid #E8C872',
              paddingBottom: '0.5rem',
              display: 'inline-block',
            }}
          >
            <span style={{ color: '#b8952e' }}>CB MEDIA</span>{' '}
            Content Studio
          </Heading>
          <Text size={2} muted>
            Welcome back. Here&apos;s where things stand.
          </Text>
        </Stack>

        {/* Status Cards */}
        <Grid columns={3} gap={3}>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={0} muted style={{ letterSpacing: '0.04em' }}>PUBLISHED</Text>
              <Heading size={3}>{stats.sectionCount}</Heading>
            </Stack>
          </Card>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={0} muted style={{ letterSpacing: '0.04em' }}>HIDDEN</Text>
              <Heading size={3}>{stats.hiddenCount}</Heading>
            </Stack>
          </Card>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={0} muted style={{ letterSpacing: '0.04em' }}>LAST EDIT</Text>
              <Heading size={3} style={{ fontSize: '1.1rem' }}>{formatTimeAgo(stats.lastEdited)}</Heading>
            </Stack>
          </Card>
        </Grid>

        {/* Drafts Warning */}
        {stats.draftCount > 0 && (
          <Card padding={3} radius={2} tone="caution" border>
            <Flex align="center" gap={2}>
              <Text size={1}>⚠️</Text>
              <Text size={1}>
                {stats.draftCount} unpublished {stats.draftCount === 1 ? 'draft' : 'drafts'} — remember to publish when ready
              </Text>
            </Flex>
          </Card>
        )}

        {/* Quick Actions */}
        <Stack space={2}>
          <Text size={0} weight="semibold" style={{ letterSpacing: '0.06em' }}>
            QUICK ACTIONS
          </Text>
          <Card radius={2} border overflow="hidden">
            <Stack>
              {QUICK_ACTIONS.map((action, i) => (
                <Card
                  key={action.title}
                  padding={4}
                  tone="default"
                  style={{
                    cursor: 'pointer',
                    borderTop: i > 0 ? '1px solid var(--card-border-color)' : undefined,
                  }}
                  onClick={() => {
                    if (action.external && action.href) {
                      window.open(action.href, '_blank', 'noopener,noreferrer')
                    } else if (action.path) {
                      router.navigateUrl({ path: action.path })
                    }
                  }}
                >
                  <Flex align="center" gap={3}>
                    <Text size={2}>{action.icon}</Text>
                    <Stack space={1} style={{ flex: 1 }}>
                      <Text size={1} weight="semibold">{action.title}</Text>
                      <Text size={1} muted>{action.description}</Text>
                    </Stack>
                    <Text size={1} muted>{action.external ? '↗' : '→'}</Text>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Card>
        </Stack>

        {/* Tip of the Day */}
        <Card padding={4} radius={2} border tone="default">
          <Flex align="flex-start" gap={3}>
            <Text size={1} style={{ color: '#E8C872' }}>💡</Text>
            <Stack space={1}>
              <Text size={0} weight="semibold" style={{ letterSpacing: '0.04em', color: '#b8952e' }}>
                TIP OF THE DAY
              </Text>
              <Text size={1} muted>{todayTip}</Text>
            </Stack>
          </Flex>
        </Card>
      </Stack>
    </Flex>
  )
}
