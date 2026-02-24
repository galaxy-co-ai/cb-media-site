import { createClient, type QueryParams } from 'next-sanity'
import { apiVersion, dataset, projectId, isSanityConfigured } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl: '/studio',
  },
})

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: QueryParams
  tags?: string[]
}): Promise<T> {
  if (!isSanityConfigured) {
    throw new Error('Sanity client not configured')
  }

  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 30 : false,
      tags,
    },
  })
}
