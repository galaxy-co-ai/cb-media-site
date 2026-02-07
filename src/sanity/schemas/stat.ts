import { defineType } from 'sanity'

export default defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  fields: [
    {
      name: 'value',
      title: 'Number',
      type: 'string',
      description: 'The impressive figure (e.g., "+193%", "50K+", "$2.5M")',
      placeholder: '+193%',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'label',
      title: 'What It Means',
      type: 'string',
      description: 'Brief explanation of the number',
      placeholder: 'Engagement Growth',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      value: 'value',
      label: 'label',
    },
    prepare({ value, label }) {
      return {
        title: value || 'New Stat',
        subtitle: label || 'Add a label...',
      }
    },
  },
})
