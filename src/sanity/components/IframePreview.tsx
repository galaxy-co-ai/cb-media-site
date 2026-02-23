import { useEffect, useState } from 'react'
import { Flex, Button, Card, Text } from '@sanity/ui'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'

export function IframePreview({ document }: { document: { displayed: { slug?: { current?: string }; _type?: string } } }) {
  const [key, setKey] = useState(0)
  const { displayed } = document
  const slug = displayed?.slug?.current
  const url = slug ? `${SITE_URL}/#${slug}` : SITE_URL

  useEffect(() => {
    setKey((k) => k + 1)
  }, [slug])

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <Card padding={2} tone="transparent">
        <Flex align="center" gap={2}>
          <Button
            text="Refresh"
            mode="ghost"
            fontSize={1}
            onClick={() => setKey((k) => k + 1)}
          />
          <Button
            as="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            text="Open in new tab ↗"
            mode="ghost"
            fontSize={1}
          />
          <Text size={1} muted style={{ marginLeft: 'auto' }}>
            {url}
          </Text>
        </Flex>
      </Card>
      <iframe
        key={key}
        src={url}
        style={{ flex: 1, width: '100%', border: 'none' }}
        title="Site preview"
      />
    </Flex>
  )
}
