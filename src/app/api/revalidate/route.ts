import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{
      _type: string
    }>(req, process.env.SANITY_REVALIDATE_SECRET)

    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      )
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Bad request' },
        { status: 400 }
      )
    }

    const tagMap: Record<string, string[]> = {
      section: ['sections'],
      siteSettings: ['siteSettings'],
    }

    const tags = tagMap[body._type] || [body._type]
    for (const tag of tags) {
      revalidateTag(tag, 'default')
    }

    return NextResponse.json({
      status: 'ok',
      revalidated: tags,
      now: Date.now(),
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
