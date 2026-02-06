import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'included', false && 'excluded')).toBe('base included')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null)).toBe('base')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('handles objects with boolean values', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })
})
