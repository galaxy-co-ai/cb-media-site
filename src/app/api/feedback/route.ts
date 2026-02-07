import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazy initialization to avoid build errors when API key isn't set
let resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Telegram configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendTelegramNotification(
  message: string,
  screenshot: string | null
) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping notification')
    return
  }

  try {
    if (screenshot) {
      // Send photo with caption
      const base64Data = screenshot.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const blob = new Blob([buffer], { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('chat_id', TELEGRAM_CHAT_ID)
      formData.append('photo', blob, 'screenshot.jpg')
      formData.append('caption', message.substring(0, 1024)) // Telegram caption limit
      formData.append('parse_mode', 'HTML')

      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        { method: 'POST', body: formData }
      )
    } else {
      // Send text message
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      )
    }
  } catch (error) {
    console.error('Telegram notification error:', error)
  }
}

interface FeedbackRequest {
  element: {
    selector: string
    text: string
    tagName: string
  } | null
  note: string
  url: string
  timestamp: string
  screenshot: string | null
}

export async function POST(request: Request) {
  try {
    const body: FeedbackRequest = await request.json()
    const { element, note, url, timestamp, screenshot } = body

    if (!note?.trim()) {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 })
    }

    // Build Telegram message
    const telegramMessage = `<b>📝 CB Media Feedback</b>

<b>Page:</b> ${url}

<b>Element:</b> ${element ? `<code>${element.selector}</code>` : 'None selected'}

<b>Feedback:</b>
${note}

<i>${new Date(timestamp).toLocaleString()}</i>`

    // Send Telegram notification (non-blocking)
    sendTelegramNotification(telegramMessage, screenshot)

    // Build email content
    const screenshotHtml = screenshot
      ? `
      <div class="field">
        <div class="label">Screenshot (element highlighted in red)</div>
        <div style="margin-top: 8px;">
          <img src="cid:screenshot" alt="Screenshot with highlighted element" style="max-width: 100%; border-radius: 8px; border: 1px solid #e0e0e0;" />
        </div>
      </div>
      `
      : ''

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #0a0a0a; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 16px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0; }
    .element-info { font-family: monospace; font-size: 13px; background: #1a1a1a; color: #4ade80; padding: 12px; border-radius: 4px; }
    .note { white-space: pre-wrap; }
    .footer { margin-top: 20px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">CB Media Site Feedback</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Page URL</div>
        <div class="value"><a href="${url}">${url}</a></div>
      </div>

      <div class="field">
        <div class="label">Element</div>
        <div class="element-info">${element ? `${element.selector}<br/>Text: "${element.text || '(empty)'}"` : 'No specific element selected'}</div>
      </div>

      <div class="field">
        <div class="label">Feedback</div>
        <div class="value note">${note}</div>
      </div>

      ${screenshotHtml}

      <div class="footer">
        Submitted at ${new Date(timestamp).toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
`

    const textContent = `
CB Media Site Feedback
======================

Page: ${url}

Element: ${element ? `${element.selector} - "${element.text || '(empty)'}"` : 'No specific element selected'}

Feedback:
${note}

${screenshot ? '[Screenshot attached]' : ''}

---
Submitted at ${new Date(timestamp).toLocaleString()}
`

    // Check if Resend is configured
    const resendClient = getResend()
    if (!resendClient) {
      console.log('Feedback received (Resend not configured):', { element, note, url, timestamp, hasScreenshot: !!screenshot })
      return NextResponse.json({
        success: true,
        message: 'Feedback logged (email not configured)'
      })
    }

    // Prepare attachments if screenshot exists
    const attachments = screenshot
      ? [
          {
            filename: 'screenshot.jpg',
            content: screenshot.split(',')[1], // Remove data:image/jpeg;base64, prefix
            contentType: 'image/jpeg',
            cid: 'screenshot', // Content-ID for inline image
          },
        ]
      : undefined

    // Send email via Resend
    const { error } = await resendClient.emails.send({
      from: 'CB Media Feedback <feedback@resend.dev>',
      to: 'dalton@galaxyco.ai',
      subject: `Site Feedback: ${note.substring(0, 50)}${note.length > 50 ? '...' : ''}`,
      html: emailHtml,
      text: textContent,
      attachments,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
