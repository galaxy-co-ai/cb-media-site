import { defineType } from 'sanity'

export default defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  fields: [
    {
      name: 'value',
      title: 'The Number',
      type: 'string',
      description:
        'Enter the stat with its sign and unit — this animates on the page with a rolling counter effect. Examples: "+193%", "-57%", "+454M", "50K+"',
      placeholder: '+193%',
      validation: (Rule) =>
        Rule.required().regex(/^[+\-]?\d+[%MBKk+]*$/, {
          name: 'stat format',
          invert: false,
        }).error('Use a number with an optional sign and unit, like "+193%" or "50K+"'),
    },
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description:
        'A short description of what this number represents (e.g. "ROI Increase", "CAC Reduction")',
      placeholder: 'ROI Increase',
      validation: (Rule) => Rule.required().max(40),
    },
  ],
  preview: {
    select: { value: 'value', label: 'label' },
    prepare({ value, label }) {
      return {
        title: value || 'New Stat',
        subtitle: label || 'Add a label...',
      }
    },
  },
})
