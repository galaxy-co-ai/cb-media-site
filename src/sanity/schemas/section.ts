import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'section',
  title: 'Website Section',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'cards', title: 'Cards & Stats' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      group: 'content',
      description:
        'The big heading visitors see for this section (e.g. "What We Do")',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .warning('Shorter titles look better on mobile — aim for under 40 characters'),
    }),
    defineField({
      name: 'content',
      title: 'Body Text',
      type: 'array',
      group: 'content',
      description:
        'Write your section copy here. Use Bold for emphasis. Keep paragraphs short — visitors scan, they don\'t read.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h3' },
            { title: 'Small Heading', value: 'h4' },
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
              title: 'Image Description',
              type: 'string',
              description:
                'Describe this image for screen readers and SEO (e.g. "Team meeting in a modern office")',
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'stats',
      title: 'Key Numbers',
      type: 'array',
      group: 'cards',
      of: [{ type: 'stat' }],
      description:
        'Add headline statistics that scroll-animate on the page. Use the format: "+193%", "-57%", "+454M"',
    }),
    defineField({
      name: 'serviceItems',
      title: 'Service / Feature Cards',
      type: 'array',
      group: 'cards',
      description:
        'Each card has a title, short description, and a call-to-action label. These appear as an interactive list on desktop and expandable cards on mobile.',
      of: [
        {
          type: 'object',
          name: 'serviceItem',
          title: 'Card',
          fields: [
            {
              name: 'title',
              title: 'Card Title',
              type: 'string',
              description: 'e.g. "Media Efficiency & Coverage"',
              validation: (Rule) => Rule.required().max(80),
            },
            {
              name: 'description',
              title: 'Card Description',
              type: 'text',
              rows: 3,
              description:
                'One or two sentences explaining this service. Keep it under 200 characters.',
              validation: (Rule) =>
                Rule.required()
                  .max(250)
                  .warning('Shorter descriptions read better — aim for under 200 characters'),
            },
            {
              name: 'ctaText',
              title: 'Button Label',
              type: 'string',
              description:
                'Short action label in ALL CAPS (e.g. "EFFICIENCY AUDIT", "LEARN MORE")',
              validation: (Rule) => Rule.required().max(30),
            },
            {
              name: 'ctaLink',
              title: 'Button Link',
              type: 'url',
              description:
                'Optional — where should this button go? Leave empty to scroll to the contact section.',
              validation: (Rule) =>
                Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
            },
          ],
          preview: {
            select: { title: 'title', cta: 'ctaText' },
            prepare({ title, cta }) {
              return {
                title: title || 'Untitled Card',
                subtitle: cta || 'No button label set',
              }
            },
          },
        },
      ],
    }),

    defineField({
      name: 'slug',
      title: 'Section ID',
      type: 'slug',
      group: 'settings',
      description:
        'Auto-generated from the title. Used in the page URL. You generally don\'t need to change this.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Position on Page',
      type: 'number',
      group: 'settings',
      description:
        'Controls where this section appears. 1 = first, 2 = second, etc.',
      initialValue: 10,
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
    defineField({
      name: 'isVisible',
      title: 'Show on Website',
      type: 'boolean',
      group: 'settings',
      description:
        'Toggle OFF to temporarily hide this section from your website. You can turn it back on anytime — nothing is deleted.',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Page Order',
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
      return {
        title: `${order ?? '?'}. ${title || 'Untitled Section'}`,
        subtitle: isVisible === false ? 'Hidden from website' : 'Live on website',
      }
    },
  },
})
