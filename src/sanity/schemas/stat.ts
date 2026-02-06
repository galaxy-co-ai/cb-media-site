import { defineType } from 'sanity'

export default defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  fields: [
    {
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'The statistic value (e.g., "+193%", "-57%", "+454M")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Description of what this stat represents',
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
        title: value,
        subtitle: label,
      }
    },
  },
})
