import { defineField, defineType } from 'sanity'
import { CharCountInput } from '../components/CharCountInput'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Your Headline', default: true },
    { name: 'contact', title: 'Contact Info' },
    { name: 'cta', title: 'Call-to-Action Button' },
    { name: 'seo', title: 'SEO & Social' },
    { name: 'brand', title: 'Brand Assets' },
  ],
  fields: [
    // === Hero Group ===
    defineField({
      name: 'heroHeadline',
      title: 'Main Headline',
      type: 'string',
      group: 'hero',
      description:
        'The giant text visitors see first when they land on your site. This is your brand name — usually "CB MEDIA".',
      placeholder: 'CB MEDIA',
      initialValue: 'CB MEDIA',
      components: { input: CharCountInput },
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
      components: { input: CharCountInput },
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
      components: { input: CharCountInput },
      validation: (Rule) => Rule.max(200),
    }),

    // === Contact Group ===
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

    // === CTA Group ===
    defineField({
      name: 'ctaText',
      title: 'Button Text',
      type: 'string',
      group: 'cta',
      description:
        'The text on the big call-to-action button in your Contact section (e.g. "GET IN TOUCH", "BOOK A CALL").',
      placeholder: 'GET IN TOUCH',
      initialValue: 'GET IN TOUCH',
      components: { input: CharCountInput },
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

    // === SEO & Social Group ===
    defineField({
      name: 'metaTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description:
        'The title that appears in Google search results and browser tabs. Aim for under 60 characters.',
      placeholder: 'CB.Media | Turn Visibility Into Value',
      components: { input: CharCountInput },
      validation: (Rule) => Rule.max(60).warning('Google truncates titles longer than ~60 characters'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      description:
        'The summary that appears below your title in Google search results. Aim for 120–160 characters.',
      placeholder: 'CB.Media is the media, brand, and culture specialist...',
      components: { input: CharCountInput },
      validation: (Rule) => Rule.max(160).warning('Google truncates descriptions longer than ~160 characters'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      type: 'image',
      group: 'seo',
      description:
        'The image that appears when your site is shared on LinkedIn, Twitter, or Facebook. Recommended: 1200×630px.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'seo',
      description:
        'The small icon in browser tabs. Should be square (e.g. 32×32px or 512×512px SVG/PNG).',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      group: 'seo',
      description: 'Add your social media profiles. These can be displayed in the footer.',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Twitter / X', value: 'twitter' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'YouTube', value: 'youtube' },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'Profile URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
            },
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare({ platform, url }) {
              const labels: Record<string, string> = {
                linkedin: 'LinkedIn',
                instagram: 'Instagram',
                twitter: 'Twitter / X',
                facebook: 'Facebook',
                youtube: 'YouTube',
              }
              return {
                title: labels[platform] || platform || 'Social Link',
                subtitle: url || 'No URL set',
              }
            },
          },
        },
      ],
    }),

    // === Brand Assets Group ===
    defineField({
      name: 'logo',
      title: 'Logo (Light)',
      type: 'image',
      group: 'brand',
      description: 'Your primary logo for light backgrounds. SVG or transparent PNG recommended.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'logoDark',
      title: 'Logo (Dark)',
      type: 'image',
      group: 'brand',
      description: 'Your logo variant for dark backgrounds. Leave blank to use the light version.',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      headline: 'heroHeadline',
      email: 'contactEmail',
    },
    prepare({ headline, email }) {
      return {
        title: headline || 'Site Settings',
        subtitle: email || 'Hero, contact info, and call-to-action button',
      }
    },
  },
})
