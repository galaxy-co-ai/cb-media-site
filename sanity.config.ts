import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { buildLegacyTheme } from 'sanity'
import { schemaTypes } from './src/sanity/schemas'
import { StudioNavbar } from './src/sanity/components/StudioNavbar'
import { StudioWelcome } from './src/sanity/components/StudioWelcome'

const theme = buildLegacyTheme({
  '--black': '#0a0a0a',
  '--white': '#f5f5f5',
  '--gray-base': '#1a1a1a',
  '--gray': '#666666',
  '--component-bg': '#111111',
  '--component-text-color': '#e5e5e5',
  '--brand-primary': '#ffffff',
  '--default-button-color': '#ffffff',
  '--default-button-primary-color': '#ffffff',
  '--default-button-success-color': '#4ade80',
  '--default-button-warning-color': '#facc15',
  '--default-button-danger-color': '#f87171',
  '--state-info-color': '#60a5fa',
  '--state-success-color': '#4ade80',
  '--state-warning-color': '#facc15',
  '--state-danger-color': '#f87171',
  '--focus-color': '#60a5fa',
})

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

const PREVIEW_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'

export default defineConfig({
  name: 'cb-media-studio',
  title: 'CB Media Studio',
  basePath: '/studio',

  projectId,
  dataset,

  tools: (prev) => [
    {
      name: 'home',
      title: 'Home',
      icon: () => '🏠',
      component: StudioWelcome,
    },
    ...prev,
  ],

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Your Website')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .icon(() => '⚙️')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Hero, Contact & CTA')
              ),

            S.divider(),

            S.listItem()
              .title('Website Sections')
              .icon(() => '📄')
              .child(
                S.documentTypeList('section')
                  .title('All Sections')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }])
              ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        initial: PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      resolve: {
        locations: {
          section: {
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Section',
                  href: `/#${doc?.slug || ''}`,
                },
                { title: 'Homepage', href: '/' },
              ],
            }),
          },
          siteSettings: {
            select: { title: 'heroHeadline' },
            resolve: () => ({
              locations: [{ title: 'Homepage', href: '/' }],
            }),
          },
        },
      },
    }),
  ],

  theme,

  studio: {
    components: {
      navbar: StudioNavbar,
    },
  },

  schema: {
    types: schemaTypes,
  },
})
