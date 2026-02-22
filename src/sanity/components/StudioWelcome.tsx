import { Card, Stack, Text, Heading, Flex, Button } from '@sanity/ui'
import { useRouter } from 'sanity/router'

const QUICK_ACTIONS = [
  {
    title: 'Edit Homepage Sections',
    description: 'Update your "What We Do", "Who We Serve", results, and more.',
    intent: { type: 'edit' as const, params: {} },
    path: '/structure/section',
  },
  {
    title: 'Update Contact Info',
    description: 'Change your email, phone number, or call-to-action button.',
    intent: { type: 'edit' as const, params: { id: 'siteSettings' } },
    path: '/structure/siteSettings',
  },
  {
    title: 'Open Visual Editor',
    description: 'See your changes in real-time on the live site as you type.',
    intent: null,
    path: '/presentation',
  },
]

export function StudioWelcome() {
  const router = useRouter()

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: '100%', padding: '2rem' }}
    >
      <Stack space={5} style={{ maxWidth: 640, width: '100%' }}>
        <Stack space={3}>
          <Heading
            size={4}
            style={{
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            Welcome to CB Media Studio
          </Heading>
          <Text size={2} muted>
            This is where you manage everything visitors see on your website.
            Edit your content below, then click <strong>Publish</strong> to push
            changes live.
          </Text>
        </Stack>

        <Stack space={3}>
          {QUICK_ACTIONS.map((action) => (
            <Card
              key={action.path}
              padding={4}
              radius={2}
              shadow={1}
              tone="default"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                router.navigateUrl({ path: action.path })
              }}
            >
              <Stack space={2}>
                <Heading size={1}>{action.title}</Heading>
                <Text size={1} muted>
                  {action.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>

        <Card padding={4} radius={2} tone="caution">
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Quick Tips
            </Text>
            <Stack space={2}>
              <Text size={1} muted>
                &bull; Click any section in the sidebar to edit it
              </Text>
              <Text size={1} muted>
                &bull; Your changes go live when you click the green
                &quot;Publish&quot; button
              </Text>
              <Text size={1} muted>
                &bull; Use the Visual Editor tab to see a live preview as you
                type
              </Text>
              <Text size={1} muted>
                &bull; Toggle &quot;Show on Website&quot; OFF to hide a section
                without deleting it
              </Text>
            </Stack>
          </Stack>
        </Card>

        <Flex justify="center">
          <Button
            as="a"
            href={process.env.NEXT_PUBLIC_SITE_URL || '/'}
            target="_blank"
            rel="noopener noreferrer"
            text="View Live Site"
            tone="primary"
            mode="ghost"
            style={{ letterSpacing: '0.06em' }}
          />
        </Flex>
      </Stack>
    </Flex>
  )
}
