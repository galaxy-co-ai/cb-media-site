import { useEffect, useState } from 'react'
import { Card, Stack, Text, Heading, Flex, Button, Grid } from '@sanity/ui'
import { useRouter } from 'sanity/router'
import { useClient } from 'sanity'

interface ContentStats {
  sectionCount: number
  lastEdited: string | null
}

function useContentStats() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [stats, setStats] = useState<ContentStats>({ sectionCount: 0, lastEdited: null })

  useEffect(() => {
    const query = `{
      "sectionCount": count(*[_type == "section" && !(_id in path("drafts.**"))]),
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
    icon: '👁',
    title: 'Open Visual Editor',
    description: 'See your changes in real-time as you type',
    path: '/studio/presentation',
  },
]

export function StudioWelcome() {
  const router = useRouter()
  const stats = useContentStats()

  return (
    <Flex align="center" justify="center" style={{ height: '100%', padding: '2rem' }}>
      <Stack space={5} style={{ maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <Stack space={3}>
          <Heading
            size={4}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ color: '#E8C872' }}>CB MEDIA</span>{' '}
            Content Studio
          </Heading>
          <Text size={2} muted>
            Welcome back. Here&apos;s where things stand.
          </Text>
        </Stack>

        {/* Status Cards */}
        <Grid columns={2} gap={3}>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={1} muted>Sections published</Text>
              <Heading size={3}>{stats.sectionCount}</Heading>
            </Stack>
          </Card>
          <Card padding={4} radius={2} tone="default" border>
            <Stack space={2}>
              <Text size={1} muted>Last edited</Text>
              <Heading size={3}>{formatTimeAgo(stats.lastEdited)}</Heading>
            </Stack>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Stack space={2}>
          <Text size={1} weight="semibold" style={{ letterSpacing: '0.06em' }}>
            QUICK ACTIONS
          </Text>
          <Card radius={2} border overflow="hidden">
            <Stack>
              {QUICK_ACTIONS.map((action, i) => (
                <Card
                  key={action.path}
                  padding={4}
                  tone="default"
                  style={{
                    cursor: 'pointer',
                    borderTop: i > 0 ? '1px solid var(--card-border-color)' : undefined,
                  }}
                  onClick={() => router.navigateUrl({ path: action.path })}
                >
                  <Flex align="center" gap={3}>
                    <Text size={2}>{action.icon}</Text>
                    <Stack space={1} style={{ flex: 1 }}>
                      <Text size={1} weight="semibold">{action.title}</Text>
                      <Text size={1} muted>{action.description}</Text>
                    </Stack>
                    <Text size={1} muted>→</Text>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Card>
        </Stack>

        {/* Getting Started */}
        <Card padding={4} radius={2} border tone="default">
          <Stack space={3}>
            <Text size={1} weight="semibold">Getting Started</Text>
            <Stack space={2}>
              <Text size={1} muted>• Click any section in the sidebar to edit it</Text>
              <Text size={1} muted>• Hit &quot;Publish&quot; to push changes live</Text>
              <Text size={1} muted>• Use the Visual Editor to preview as you type</Text>
              <Text size={1} muted>• Toggle &quot;Show on Website&quot; to hide a section without deleting</Text>
            </Stack>
          </Stack>
        </Card>

        {/* View Live Site */}
        <Flex justify="center">
          <Button
            as="a"
            href={process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-media-site.vercel.app'}
            target="_blank"
            rel="noopener noreferrer"
            text="View Live Site ↗"
            tone="primary"
            mode="ghost"
            style={{ letterSpacing: '0.06em' }}
          />
        </Flex>
      </Stack>
    </Flex>
  )
}
