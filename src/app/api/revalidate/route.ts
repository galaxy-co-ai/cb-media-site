import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET

export async function POST(req: NextRequest) {
  try {
    if (!REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: 'Webhook secret not configured' },
        { status: 500 },
      )
    }

    const { isValidSignature, body } = await parseBody<{
      _type: string
      slug?: string
    }>(req, REVALIDATE_SECRET)

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    if (!body?._type) {
      return NextResponse.json({ message: 'Bad request' }, { status: 400 })
    }

    if (body._type === 'section') {
      revalidateTag('sections', 'default')
    } else if (body._type === 'siteSettings') {
      revalidateTag('siteSettings', 'default')
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      body,
    })
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 },
    )
  }
}
