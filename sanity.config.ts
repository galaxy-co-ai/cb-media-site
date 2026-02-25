import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { assist } from '@sanity/assist'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { buildLegacyTheme } from 'sanity'
import { schemaTypes } from './src/sanity/schemas'
import { StudioNavbar } from './src/sanity/components/StudioNavbar'
import { StudioWelcome } from './src/sanity/components/StudioWelcome'
import { IframePreview } from './src/sanity/components/IframePreview'

const theme = buildLegacyTheme({
  '--black': '#2C2825',
  '--white': '#F5F0EB',
  '--gray-base': '#F5F0EB',
  '--gray': '#8A8279',
  '--component-bg': '#FFFFFF',
  '--component-text-color': '#2C2825',
  '--brand-primary': '#C4875A',
  '--default-button-color': '#C4875A',
  '--default-button-primary-color': '#C4875A',
  '--default-button-success-color': '#4A8C5C',
  '--default-button-warning-color': '#C49A3C',
  '--default-button-danger-color': '#C45A5A',
  '--state-info-color': '#4A7FB5',
  '--state-success-color': '#4A8C5C',
  '--state-warning-color': '#C49A3C',
  '--state-danger-color': '#C45A5A',
  '--focus-color': '#C4875A',
  '--main-navigation-color': '#FAF7F4',
})

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

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
      icon: () => '◆',
      component: StudioWelcome,
    },
    ...prev,
  ],

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Your Website')
          .items([
            // Hero & Branding — singleton, opens directly to form
            S.listItem()
              .title('Hero & Branding')
              .id('siteSettings')
              .icon(() => '◆')
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
              .icon(() => '▤')
              .child(
                S.list()
                  .title('Homepage Sections')
                  .items([
                    orderableDocumentListDeskItem({
                      type: 'section',
                      title: 'All Sections',
                      icon: () => '≡',
                      S,
                      context,
                    }),
                    S.listItem()
                      .title('Visible on Site')
                      .icon(() => '●')
                      .child(
                        S.documentList()
                          .title('Visible on Site')
                          .filter('_type == "section" && isVisible == true')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Hidden')
                      .icon(() => '○')
                      .child(
                        S.documentList()
                          .title('Hidden Sections')
                          .filter('_type == "section" && isVisible != true')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                      ),
                  ])
              ),
          ]),
      defaultDocumentNode: (S, { schemaType }) => {
        if (schemaType === 'section' || schemaType === 'siteSettings') {
          return S.document().views([
            S.view.form(),
            S.view.component(IframePreview).title('Preview'),
          ])
        }
        return S.document().views([S.view.form()])
      },
    }),
    presentationTool({
      previewUrl: {
        draftMode: {
          enable: '/api/draft/enable',
        },
      },
    }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
    media(),
    assist(),
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
