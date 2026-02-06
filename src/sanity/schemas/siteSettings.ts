import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'Main headline (e.g., "CB.MEDIA")',
      initialValue: 'CB.MEDIA',
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
      description: 'Tagline below the headline',
      initialValue: 'Turn Visibility Into Value',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Hero Subtext',
      type: 'string',
      description: 'Three pillars or short description',
      initialValue: 'Media. Creative. Culture.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      initialValue: "Let's Talk",
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'string',
      description: 'Email link or calendar booking URL',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
