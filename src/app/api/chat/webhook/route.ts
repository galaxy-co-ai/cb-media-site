import { NextResponse } from 'next/server'
import { addMessage, getSessionByTelegramId } from '@/lib/redis'

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    text?: string
    reply_to_message?: {
      message_id: number
      text?: string
    }
  }
}

// Telegram webhook - receives replies
export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json()

    // Only process text message replies
    if (!update.message?.text || !update.message.reply_to_message) {
      return NextResponse.json({ ok: true })
    }

    const replyToMessageId = update.message.reply_to_message.message_id
    const replyText = update.message.text

    // Find the session this reply belongs to
    const sessionId = await getSessionByTelegramId(replyToMessageId)

    if (!sessionId) {
      console.log('No session found for Telegram message:', replyToMessageId)
      return NextResponse.json({ ok: true })
    }

    // Add the support reply to the session
    await addMessage(sessionId, {
      role: 'support',
      text: replyText,
    })

    console.log(`Added support reply to session ${sessionId}: ${replyText}`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

// Telegram sends GET to verify webhook
export async function GET() {
  return NextResponse.json({ status: 'Webhook active' })
}
