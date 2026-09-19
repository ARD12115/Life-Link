import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push"

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER')

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@lifelink.blood',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requestId, hospitalName, bloodGroup, urgency } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch matching donors
    const { data: donors, error: donorError } = await supabase
      .from('donors')
      .select('id, name, phone, user_id')
      .eq('blood_group', bloodGroup)
      .eq('available', true)

    if (donorError) throw donorError

    if (!donors || donors.length === 0) {
      return new Response(JSON.stringify({ message: 'No matching donors found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const userIds = donors.map(d => d.user_id).filter(Boolean)

    // 2. Fetch push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', userIds)

    const alertMessage = `🚨 EMERGENCY: ${hospitalName} needs ${bloodGroup} blood (${urgency}).`

    // 3. Send SMS via Twilio
    const smsPromises = donors.filter(d => d.phone).map(async (donor) => {
      try {
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: TWILIO_FROM_NUMBER!,
              To: donor.phone!,
              Body: `${alertMessage} Respond at: ${Deno.env.get('APP_URL') || 'http://localhost:3001'}/donor`,
            }),
          }
        )
      } catch (err) {
        console.error(`Failed to send SMS to ${donor.name}:`, err)
      }
    })

    // 4. Send Web Push
    const pushPromises = (subscriptions || []).map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify({
          title: '🚨 Emergency Blood Request',
          body: alertMessage,
          url: `${Deno.env.get('APP_URL') || 'http://localhost:3001'}/donor`
        }))
      } catch (err) {
        console.error('Failed to send push notification:', err)
      }
    })

    await Promise.all([...smsPromises, ...pushPromises])

    return new Response(JSON.stringify({ 
      message: `Alerts dispatched to ${donors.length} donors.`,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
