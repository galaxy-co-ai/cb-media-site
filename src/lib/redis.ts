import { Redis } from '@upstash/redis'

// Lazy initialization
let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

export interface ChatMessage {
  id: string
  role: 'user' | 'support'
  text: string
  timestamp: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  telegramMessageId?: number
  createdAt: string
  updatedAt: string
}

const CHAT_TTL = 60 * 60 * 24 // 24 hours

export async function getSession(sessionId: string): Promise<ChatSession | null> {
  const redis = getRedis()
  if (!redis) return null

  const session = await redis.get<ChatSession>(`chat:${sessionId}`)
  return session
}

export async function saveSession(session: ChatSession): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  session.updatedAt = new Date().toISOString()
  await redis.set(`chat:${session.id}`, session, { ex: CHAT_TTL })
}

export async function addMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<ChatSession> {
  const redis = getRedis()

  let session = await getSession(sessionId)

  if (!session) {
    session = {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const newMessage: ChatMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  session.messages.push(newMessage)
  session.updatedAt = new Date().toISOString()

  if (redis) {
    await redis.set(`chat:${sessionId}`, session, { ex: CHAT_TTL })
  }

  return session
}

export async function setTelegramMessageId(
  sessionId: string,
  messageId: number
): Promise<void> {
  const session = await getSession(sessionId)
  if (session) {
    session.telegramMessageId = messageId
    await saveSession(session)
  }
}

// Map Telegram message ID to session ID for webhook replies
export async function mapTelegramToSession(
  telegramMessageId: number,
  sessionId: string
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  await redis.set(`tg:${telegramMessageId}`, sessionId, { ex: CHAT_TTL })
}

export async function getSessionByTelegramId(
  telegramMessageId: number
): Promise<string | null> {
  const redis = getRedis()
  if (!redis) return null

  return await redis.get<string>(`tg:${telegramMessageId}`)
}
