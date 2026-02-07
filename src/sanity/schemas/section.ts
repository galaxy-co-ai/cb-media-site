import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'section',
  title: 'Content Section',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Content', default: true },
    { name: 'settings', title: '⚙️ Settings' },
  ],
  fields: [
    // Content Fields
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      group: 'content',
      description: 'This appears as the accordion header (e.g., "Our Services")',
      placeholder: 'e.g., Our Expertise',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'content',
      description: 'Add your text, headings, and images here. Use the toolbar to format.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal Text', value: 'normal' },
            { title: 'Heading (Medium)', value: 'h3' },
            { title: 'Heading (Small)', value: 'h4' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image (helps with accessibility & SEO)',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Key Numbers',
      type: 'array',
      group: 'content',
      of: [{ type: 'stat' }],
      description: 'Optional: Add impressive statistics (e.g., "+193% Growth", "50K+ Followers")',
    }),
    defineField({
      name: 'serviceItems',
      title: 'Service Cards',
      type: 'array',
      group: 'content',
      description: 'Add service offerings with CTAs. Displays in a 2x2 grid with hover effects.',
      of: [
        {
          type: 'object',
          name: 'serviceItem',
          title: 'Service Item',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Service name (e.g., "Media Efficiency & Coverage")',
              validation: (Rule) => Rule.required().max(80),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'Brief description of the service',
              validation: (Rule) => Rule.required().max(200),
            },
            {
              name: 'ctaText',
              title: 'CTA Button Text',
              type: 'string',
              description: 'Button text (e.g., "EFFICIENCY AUDIT")',
              validation: (Rule) => Rule.required().max(30),
            },
            {
              name: 'ctaLink',
              title: 'CTA Link (Optional)',
              type: 'url',
              description: 'Where the button links to (leave empty for contact scroll)',
            },
          ],
          preview: {
            select: {
              title: 'title',
              cta: 'ctaText',
            },
            prepare({ title, cta }) {
              return {
                title: title || 'Untitled Service',
                subtitle: cta ? `CTA: ${cta}` : 'No CTA set',
              }
            },
          },
        },
      ],
    }),

    // Settings Fields
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'settings',
      description: 'Auto-generated from title. Click "Generate" after entering a title.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      group: 'settings',
      description: 'Use 1, 2, 3... to arrange sections. Lower numbers appear first.',
      placeholder: '1',
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
    defineField({
      name: 'isVisible',
      title: 'Show on Website',
      type: 'boolean',
      group: 'settings',
      description: 'Turn OFF to hide this section without deleting it',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
      isVisible: 'isVisible',
    },
    prepare({ title, order, isVisible }) {
      const status = isVisible ? '🌐 Live' : '🔒 Hidden'
      return {
        title: `${order ?? '?'}. ${title || 'Untitled Section'}`,
        subtitle: status,
      }
    },
  },
})
