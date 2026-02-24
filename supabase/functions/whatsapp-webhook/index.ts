// WhatsApp Cloud API Webhook - Supabase Edge Function
// Handles webhook verification (GET) and incoming messages (POST)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'orange-messenger-verify-2026'
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || ''
const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Webhook Verification (GET) ─────────────────────────────────
function handleVerification(url: URL): Response {
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully')
    return new Response(challenge, { status: 200 })
  }

  console.error('❌ Webhook verification failed')
  return new Response('Forbidden', { status: 403 })
}

// ─── Process Incoming Message ────────────────────────────────────
async function processMessage(message: any, contact: any, metadata: any) {
  const phoneNumber = contact.wa_id
  const contactName = contact.profile?.name || phoneNumber
  const messageType = message.type
  const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString()

  console.log(`📩 Message from ${contactName} (${phoneNumber}): type=${messageType}`)

  // Extract message content based on type
  let content = ''
  let mediaUrl = null

  switch (messageType) {
    case 'text':
      content = message.text?.body || ''
      break
    case 'image':
      content = message.image?.caption || '[Imagem]'
      mediaUrl = message.image?.id
      break
    case 'audio':
      content = '[Áudio]'
      mediaUrl = message.audio?.id
      break
    case 'video':
      content = message.video?.caption || '[Vídeo]'
      mediaUrl = message.video?.id
      break
    case 'document':
      content = message.document?.filename || '[Documento]'
      mediaUrl = message.document?.id
      break
    case 'location':
      content = `[Localização: ${message.location?.latitude}, ${message.location?.longitude}]`
      break
    case 'sticker':
      content = '[Sticker]'
      break
    case 'reaction':
      content = `[Reação: ${message.reaction?.emoji}]`
      break
    default:
      content = `[${messageType}]`
  }

  // 1. Find or create contact
  let { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('phone', phoneNumber)
    .single()

  let contactId: string

  if (existingContact) {
    contactId = existingContact.id
  } else {
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        name: contactName,
        phone: phoneNumber,
        metadata: { source: 'whatsapp' },
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return
    }
    contactId = newContact!.id
  }

  // 2. Find or create conversation
  let { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('contact_id', contactId)
    .eq('status', 'open')
    .single()

  let conversationId: string

  if (existingConversation) {
    conversationId = existingConversation.id
    // Update last message timestamp and preview
    await supabase
      .from('conversations')
      .update({
        last_message_at: timestamp,
        last_message_preview: content.substring(0, 100),
        unread_count: 1,
      })
      .eq('id', conversationId)
  } else {
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        channel: 'whatsapp',
        status: 'open',
        last_message_at: timestamp,
        unread_count: 1,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return
    }
    conversationId = newConversation!.id
  }

  // 3. Save message
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_type: 'customer',
    content: content,
    content_type: messageType === 'text' ? 'text' : messageType,
    wa_message_id: message.id,
    status: 'delivered',
    media_url: mediaUrl,
    metadata: {
      sender_name: contactName,
      wa_id: phoneNumber,
      timestamp: message.timestamp,
    },
  })

  if (msgError) {
    console.error('Error saving message:', msgError)
    return
  }

  console.log(`✅ Message saved: conversation=${conversationId}`)
}

// ─── Process Status Updates ──────────────────────────────────────
async function processStatus(status: any) {
  const messageId = status.id
  const statusType = status.status // sent, delivered, read, failed

  console.log(`📊 Status update: ${messageId} → ${statusType}`)

  // Update message status in database
  const { error } = await supabase
    .from('messages')
    .update({
      status: statusType,
      metadata: {
        status_timestamp: status.timestamp,
        ...(status.errors ? { errors: status.errors } : {}),
      },
    })
    .eq('wa_message_id', messageId)

  if (error) {
    console.error('Error updating status:', error)
  }
}

// ─── Handle Incoming Webhook (POST) ─────────────────────────────
async function handleWebhook(request: Request): Promise<Response> {
  try {
    const body = await request.json()

    // WhatsApp sends notifications in this format
    if (body.object !== 'whatsapp_business_account') {
      return new Response('Not a WhatsApp event', { status: 400 })
    }

    const entries = body.entry || []

    for (const entry of entries) {
      const changes = entry.changes || []

      for (const change of changes) {
        if (change.field !== 'messages') continue

        const value = change.value
        const metadata = value.metadata
        const messages = value.messages || []
        const contacts = value.contacts || []
        const statuses = value.statuses || []

        // Process incoming messages
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i]
          const contact = contacts[i] || contacts[0]
          await processMessage(message, contact, metadata)
        }

        // Process status updates
        for (const status of statuses) {
          await processStatus(status)
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

// ─── Send Message via WhatsApp Cloud API ─────────────────────────
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  type: 'text' | 'template' = 'text'
) {
  const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`

  const body =
    type === 'text'
      ? {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        }
      : {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: message,
            language: { code: 'pt_BR' },
          },
        }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const result = await response.json()

  if (!response.ok) {
    console.error('Error sending message:', result)
    throw new Error(`WhatsApp API error: ${result.error?.message}`)
  }

  return result
}

// ─── Main Handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  // GET = Webhook verification
  if (req.method === 'GET') {
    return handleVerification(url)
  }

  // POST = Incoming webhook events
  if (req.method === 'POST') {
    // Check if this is a "send message" request from our frontend
    const authHeader = req.headers.get('Authorization')
    if (authHeader && url.pathname.includes('/send')) {
      try {
        const { to, message, type } = await req.json()
        const result = await sendWhatsAppMessage(to, message, type)
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Otherwise, it's an incoming webhook from Meta
    const response = await handleWebhook(req)
    return new Response(response.body, {
      status: response.status,
      headers: { ...corsHeaders },
    })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders })
})
