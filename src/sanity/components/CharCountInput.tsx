import { useCallback } from 'react'
import { Flex, Text } from '@sanity/ui'
import { type StringInputProps, type TextInputProps } from 'sanity'

type Props = StringInputProps | TextInputProps

function getMaxLength(schemaType: Props['schemaType']): number | undefined {
  // Extract max from validation rules via internal _rules array
  const validation = (schemaType as unknown as Record<string, unknown>).validation
  if (!validation || !Array.isArray(validation)) return undefined
  for (const rule of validation) {
    const rules = (rule as Record<string, unknown>)?._rules
    if (!Array.isArray(rules)) continue
    const maxRule = rules.find((r: Record<string, unknown>) => r.flag === 'max')
    if (maxRule) return (maxRule as Record<string, unknown>).constraint as number
  }
  return undefined
}

export function CharCountInput(props: Props) {
  const { value, renderDefault } = props
  const max = getMaxLength(props.schemaType)
  const count = typeof value === 'string' ? value.length : 0

  const getColor = useCallback(() => {
    if (!max) return undefined
    if (count > max) return '#c53030'
    if (count > max * 0.85) return '#c9960c'
    return undefined
  }, [count, max])

  return (
    <>
      {renderDefault(props)}
      {max && (
        <Flex justify="flex-end" paddingTop={1}>
          <Text size={0} muted style={{ color: getColor(), fontVariantNumeric: 'tabular-nums' }}>
            {count} / {max}
          </Text>
        </Flex>
      )}
    </>
  )
}
