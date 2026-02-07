import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'hero', title: '🦸 Hero Section', default: true },
    { name: 'contact', title: '📞 Contact Info' },
    { name: 'cta', title: '🎯 Call-to-Action' },
  ],
  fields: [
    // Hero Section Fields
    defineField({
      name: 'heroHeadline',
      title: 'Main Headline',
      type: 'string',
      group: 'hero',
      description: 'The big text at the very top of your site',
      placeholder: 'CB MEDIA',
      initialValue: 'CB MEDIA',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'heroTagline',
      title: 'Tagline',
      type: 'string',
      group: 'hero',
      description: 'The secondary headline right below the main one',
      placeholder: 'Turn Visibility Into Value',
      initialValue: 'Turn Visibility Into Value',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Description',
      type: 'text',
      group: 'hero',
      rows: 2,
      description: 'A brief description of what you do (1-2 sentences)',
      placeholder: 'Architects of culture, community, and impact...',
      initialValue: 'Architects of culture, community, and impact. Engineering brands for long-term durability, not just short-term spikes.',
    }),

    // Contact Info Fields
    defineField({
      name: 'contactEmail',
      title: 'Email Address',
      type: 'string',
      group: 'contact',
      description: 'Where clients can reach you',
      placeholder: 'hello@cbmedia.com',
      validation: (Rule) => Rule.email().error('Please enter a valid email address'),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Phone Number',
      type: 'string',
      group: 'contact',
      description: 'Your business phone (optional)',
      placeholder: '+1 (555) 123-4567',
    }),

    // CTA Fields
    defineField({
      name: 'ctaText',
      title: 'Button Text',
      type: 'string',
      group: 'cta',
      description: 'Text that appears on your main call-to-action button',
      placeholder: "Let's Talk",
      initialValue: "Let's Talk",
    }),
    defineField({
      name: 'ctaLink',
      title: 'Button Link',
      type: 'string',
      group: 'cta',
      description: 'Where should the button go? (email, Calendly, contact page, etc.)',
      placeholder: 'mailto:hello@cbmedia.com',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: '⚙️ Site Settings',
        subtitle: 'Hero, Contact & CTA configuration',
      }
    },
  },
})
