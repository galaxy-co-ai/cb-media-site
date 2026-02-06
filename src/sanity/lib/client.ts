import { createClient, type QueryParams } from 'next-sanity'
import { apiVersion, dataset, projectId, isSanityConfigured } from '../env'

// Only create client if Sanity is configured
const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: QueryParams
  tags?: string[]
}): Promise<T> {
  if (!client) {
    throw new Error('Sanity client not configured')
  }

  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 30 : 3600,
      tags,
    },
  })
}
