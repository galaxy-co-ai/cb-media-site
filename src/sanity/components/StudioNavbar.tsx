import type { NavbarProps } from 'sanity'
import { Flex, Text } from '@sanity/ui'

export function StudioNavbar(props: NavbarProps) {
  return (
    <Flex align="center">
      <Flex
        align="center"
        gap={2}
        paddingLeft={4}
        paddingRight={3}
        style={{ whiteSpace: 'nowrap' }}
      >
        <Text
          size={1}
          weight="semibold"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            letterSpacing: '0.12em',
          }}
        >
          <span style={{ color: '#E8C872' }}>CB</span>{' '}
          MEDIA
        </Text>
        <Text size={0} muted style={{ letterSpacing: '0.08em' }}>
          Studio
        </Text>
      </Flex>
      {props.renderDefault(props)}
    </Flex>
  )
}
