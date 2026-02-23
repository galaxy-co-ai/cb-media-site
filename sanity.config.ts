import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { buildLegacyTheme } from 'sanity'
import { schemaTypes } from './src/sanity/schemas'
import { StudioNavbar } from './src/sanity/components/StudioNavbar'
import { StudioWelcome } from './src/sanity/components/StudioWelcome'

const theme = buildLegacyTheme({
  '--black': '#2d2926',
  '--white': '#f7f4f0',
  '--gray-base': '#faf8f5',
  '--gray': '#8a8279',
  '--component-bg': '#fefcfa',
  '--component-text-color': '#2d2926',
  '--brand-primary': '#E8C872',
  '--default-button-color': '#E8C872',
  '--default-button-primary-color': '#E8C872',
  '--default-button-success-color': '#3d9a50',
  '--default-button-warning-color': '#c9960c',
  '--default-button-danger-color': '#c53030',
  '--state-info-color': '#3b82b8',
  '--state-success-color': '#3d9a50',
  '--state-warning-color': '#c9960c',
  '--state-danger-color': '#c53030',
  '--focus-color': '#E8C872',
  '--main-navigation-color': '#f0ebe4',
})

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

const PREVIEW_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'

export default defineConfig({
  name: 'default',
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
            // Hero & Branding — singleton, opens directly to form
            S.listItem()
              .title('Hero & Branding')
              .id('siteSettings')
              .icon(() => '✏️')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Your headline, contact info, and call-to-action')
              ),

            S.divider(),

            // Homepage Sections — with sub-filters
            S.listItem()
              .title('Homepage Sections')
              .icon(() => '📄')
              .child(
                S.list()
                  .title('Homepage Sections')
                  .items([
                    S.listItem()
                      .title('All Sections')
                      .icon(() => '📋')
                      .child(
                        S.documentTypeList('section')
                          .title('All Sections')
                          .defaultOrdering([{ field: 'order', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Visible on Site')
                      .icon(() => '🟢')
                      .child(
                        S.documentList()
                          .title('Visible on Site')
                          .filter('_type == "section" && isVisible == true')
                          .defaultOrdering([{ field: 'order', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Hidden')
                      .icon(() => '⚫')
                      .child(
                        S.documentList()
                          .title('Hidden Sections')
                          .filter('_type == "section" && isVisible != true')
                          .defaultOrdering([{ field: 'order', direction: 'asc' }])
                      ),
                  ])
              ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        draftMode: {
          enable: `${PREVIEW_URL}/api/draft-mode/enable`,
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
