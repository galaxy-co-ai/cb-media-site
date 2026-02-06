import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PortableTextRenderer } from './PortableTextRenderer'

describe('PortableTextRenderer', () => {
  it('renders null when content is empty', () => {
    const { container } = render(<PortableTextRenderer content={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when content is undefined', () => {
    // @ts-expect-error - testing undefined case
    const { container } = render(<PortableTextRenderer content={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders paragraph content', () => {
    const content = [
      {
        _type: 'block' as const,
        _key: 'p1',
        style: 'normal' as const,
        children: [
          {
            _type: 'span' as const,
            _key: 's1',
            text: 'Test paragraph content',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ]

    render(<PortableTextRenderer content={content} />)
    expect(screen.getByText('Test paragraph content')).toBeInTheDocument()
  })

  it('renders h3 headings', () => {
    const content = [
      {
        _type: 'block' as const,
        _key: 'h1',
        style: 'h3' as const,
        children: [
          {
            _type: 'span' as const,
            _key: 's1',
            text: 'Heading Three',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ]

    render(<PortableTextRenderer content={content} />)
    const heading = screen.getByText('Heading Three')
    expect(heading.tagName).toBe('H3')
  })

  it('renders h4 headings', () => {
    const content = [
      {
        _type: 'block' as const,
        _key: 'h1',
        style: 'h4' as const,
        children: [
          {
            _type: 'span' as const,
            _key: 's1',
            text: 'Heading Four',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ]

    render(<PortableTextRenderer content={content} />)
    const heading = screen.getByText('Heading Four')
    expect(heading.tagName).toBe('H4')
  })
})
