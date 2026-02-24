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
            fontFamily: '"Space Grotesk", sans-serif',
            letterSpacing: '0.14em',
          }}
        >
          <span style={{ color: '#E8C872' }}>CB</span>{' '}
          <span style={{ color: '#E8E4DE' }}>MEDIA</span>
        </Text>
        <Text
          size={0}
          style={{
            color: '#6B6560',
            letterSpacing: '0.08em',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          Studio
        </Text>
      </Flex>
      {props.renderDefault(props)}
    </Flex>
  )
}
