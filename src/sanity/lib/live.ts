import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_VIEWER_TOKEN

export const { sanityFetch: sanityFetchLive, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
