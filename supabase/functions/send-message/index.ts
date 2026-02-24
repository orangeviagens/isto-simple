// Send WhatsApp Message - Supabase Edge Function
// Called by the Orange Messenger frontend to send messages via Cloud API

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || ''
const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

interface SendMessageRequest {
  conversation_id: string
  to: string
  message: string
  type?: 'text' | 'template'
  template_name?: string
  sender_name?: string
}

async function sendWhatsAppMessage(to: string, message: string, type: string = 'text', templateName?: string) {
  const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`

  let body: any

  if (type === 'template' && templateName) {
    body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
      },
    }
  } else {
    body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message },
    }
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
    throw new Error(result.error?.message || 'WhatsApp API error')
  }

  return result
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Verify auth - the user must be authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { conversation_id, to, message, type, template_name, sender_name }: SendMessageRequest = await req.json()

    if (!conversation_id || !to || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: conversation_id, to, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Send via WhatsApp Cloud API
    const waResult = await sendWhatsAppMessage(to, message, type || 'text', template_name)
    const waMessageId = waResult.messages?.[0]?.id

    console.log(`✅ Message sent to ${to}: ${waMessageId}`)

    // 2. Save to database
    const { data: savedMessage, error: dbError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_type: 'agent',
        sender_id: user.id,
        content: message,
        content_type: type === 'template' ? 'template' : 'text',
        status: 'sent',
        wa_message_id: waMessageId,
        metadata: {
          sender_name: sender_name || user.email || 'Agente',
          wa_response: waResult,
        },
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving message to DB:', dbError)
    }

    // 3. Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id)

    return new Response(
      JSON.stringify({
        success: true,
        whatsapp_message_id: waMessageId,
        message: savedMessage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Send message error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
