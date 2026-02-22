import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero Banner', default: true },
    { name: 'contact', title: 'Contact Info' },
    { name: 'cta', title: 'Main Button' },
  ],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Main Headline',
      type: 'string',
      group: 'hero',
      description:
        'The giant text visitors see first when they land on your site. This is your brand name — usually "CB MEDIA".',
      placeholder: 'CB MEDIA',
      initialValue: 'CB MEDIA',
      validation: (Rule) =>
        Rule.required().max(50).warning('Keep it short and punchy — this is displayed very large'),
    }),
    defineField({
      name: 'heroTagline',
      title: 'Tagline',
      type: 'string',
      group: 'hero',
      description:
        'The one-liner right below your headline. This is your brand promise in a few words.',
      placeholder: 'Turning Visibility Into Value',
      initialValue: 'Turning Visibility Into Value',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Short Description',
      type: 'text',
      group: 'hero',
      rows: 2,
      description:
        'One or two sentences about what CB.Media does. This appears below the tagline on the homepage.',
      placeholder: 'Architects of culture, community, and impact...',
      initialValue:
        'Architects of culture, community, and impact. Engineering brands for long-term durability, not just short-term spikes.',
      validation: (Rule) => Rule.max(200),
    }),

    defineField({
      name: 'contactEmail',
      title: 'Email Address',
      type: 'string',
      group: 'contact',
      description:
        'This appears in the Contact section at the bottom of your site and is used for the "Get In Touch" button.',
      placeholder: 'info@cb.media',
      validation: (Rule) =>
        Rule.email().error('This doesn\'t look like a valid email — check for typos'),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Phone Number',
      type: 'string',
      group: 'contact',
      description:
        'Displayed next to your email in the contact section. Leave blank to hide the phone number.',
      placeholder: '+1 (555) 123-4567',
    }),

    defineField({
      name: 'ctaText',
      title: 'Button Text',
      type: 'string',
      group: 'cta',
      description:
        'The text on the big call-to-action button in your Contact section (e.g. "GET IN TOUCH", "BOOK A CALL").',
      placeholder: 'GET IN TOUCH',
      initialValue: 'GET IN TOUCH',
      validation: (Rule) => Rule.max(25).warning('Button text should be 2-4 words'),
    }),
    defineField({
      name: 'ctaLink',
      title: 'Button Destination',
      type: 'string',
      group: 'cta',
      description:
        'Where should the button take visitors? Examples: "mailto:info@cb.media" for email, or a Calendly link for booking calls.',
      placeholder: 'mailto:info@cb.media',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Hero, contact info, and call-to-action button',
      }
    },
  },
})
