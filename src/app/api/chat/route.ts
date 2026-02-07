import { NextResponse } from 'next/server'
import { addMessage, getSession, mapTelegramToSession } from '@/lib/redis'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

interface ChatRequest {
  sessionId: string
  message: string
  url: string
}

// Send a chat message
export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json()
    const { sessionId, message, url } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Add message to session
    const session = await addMessage(sessionId, {
      role: 'user',
      text: message.trim(),
    })

    // Send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const isFirstMessage = session.messages.length === 1

      const telegramText = isFirstMessage
        ? `💬 <b>New Chat Session</b>\n\n<b>Page:</b> ${url}\n<b>Session:</b> <code>${sessionId}</code>\n\n<b>Message:</b>\n${message}\n\n<i>Reply to this message to respond</i>`
        : `💬 <b>Chat Reply</b>\n\n<b>Session:</b> <code>${sessionId}</code>\n\n${message}`

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'HTML',
          }),
        }
      )

      const result = await response.json()

      // Map the Telegram message ID to this session for reply tracking
      if (result.ok && result.result?.message_id) {
        await mapTelegramToSession(result.result.message_id, sessionId)
      }
    }

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Poll for new messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const lastMessageId = searchParams.get('lastMessageId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await getSession(sessionId)

    if (!session) {
      return NextResponse.json({ messages: [] })
    }

    // If lastMessageId provided, only return messages after that
    if (lastMessageId) {
      const lastIndex = session.messages.findIndex((m) => m.id === lastMessageId)
      const newMessages = lastIndex >= 0 ? session.messages.slice(lastIndex + 1) : []
      return NextResponse.json({ messages: newMessages })
    }

    return NextResponse.json({ messages: session.messages })
  } catch (error) {
    console.error('Chat poll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
