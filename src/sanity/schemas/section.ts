import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { CharCountInput } from '../components/CharCountInput'

export default defineType({
  name: 'section',
  title: 'Website Section',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'cards', title: 'Numbers & Cards' },
    { name: 'settings', title: 'Page Settings' },
  ],
  fields: [
    orderRankField({ type: 'section' }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      group: 'content',
      description:
        'The big heading visitors see for this section (e.g. "What We Do")',
      components: { input: CharCountInput },
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
      hidden: ({ document }) =>
        Array.isArray(document?.serviceItems) && document.serviceItems.length > 0,
    }),
    defineField({
      name: 'serviceItems',
      title: 'Service / Feature Cards',
      type: 'array',
      group: 'cards',
      description:
        'Each card has a title, short description, and a call-to-action label. These appear as an interactive list on desktop and expandable cards on mobile.',
      hidden: ({ document }) =>
        Array.isArray(document?.stats) && document.stats.length > 0,
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
      hidden: true,
      description: 'Auto-generated from the title.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Position on Page (Legacy)',
      type: 'number',
      group: 'settings',
      hidden: true,
      description: 'Legacy field — use drag-and-drop in "All Sections" instead.',
      initialValue: 10,
      validation: (Rule) => Rule.min(0).integer(),
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
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'title',
      isVisible: 'isVisible',
      hasStats: 'stats',
      hasServices: 'serviceItems',
    },
    prepare({ title, isVisible, hasStats, hasServices }) {
      const contentType =
        Array.isArray(hasServices) && hasServices.length > 0
          ? '🃏'
          : Array.isArray(hasStats) && hasStats.length > 0
            ? '📊'
            : '📝'
      const visibility = isVisible === false ? ' · Hidden' : ''
      return {
        title: `${contentType} ${title || 'Untitled Section'}`,
        subtitle: `${
          Array.isArray(hasServices) && hasServices.length > 0
            ? `${hasServices.length} cards`
            : Array.isArray(hasStats) && hasStats.length > 0
              ? `${hasStats.length} stats`
              : 'Text content'
        }${visibility}`,
      }
    },
  },
})
