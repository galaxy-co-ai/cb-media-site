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
          weight="bold"
          style={{
            fontFamily: '"Inter", -apple-system, sans-serif',
            letterSpacing: '0.14em',
          }}
        >
          <span style={{ color: '#C4875A' }}>CB</span>{' '}
          <span style={{ color: '#2C2825' }}>MEDIA</span>
        </Text>
        <Text
          size={0}
          style={{
            color: '#8A8279',
            letterSpacing: '0.08em',
            fontFamily: '"Inter", -apple-system, sans-serif',
          }}
        >
          Studio
        </Text>
      </Flex>
      {props.renderDefault(props)}
    </Flex>
  )
}
