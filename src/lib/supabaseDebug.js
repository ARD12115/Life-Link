// Debug utility to verify Supabase connection and data
import { supabase } from './supabase'

export async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('URL:', process.env.REACT_APP_SUPABASE_URL)
    console.log('Key loaded:', !!process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY)

    // Test basic query
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Connection failed:', error)
      return { success: false, error }
    }

    console.log('✅ Connection successful!')
    return { success: true }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function fetchAllTables() {
  console.log('📊 Fetching all table data...')

  try {
    const [donorsRes, hospitalsRes, requestsRes] = await Promise.all([
      supabase.from('donors').select('*'),
      supabase.from('hospitals').select('*'),
      supabase.from('blood_requests').select('*'),
    ])

    console.log('👥 Donors:', donorsRes.data?.length || 0, donorsRes.data)
    console.log('🏥 Hospitals:', hospitalsRes.data?.length || 0, hospitalsRes.data)
    console.log('🩸 Requests:', requestsRes.data?.length || 0, requestsRes.data)

    return {
      donors: donorsRes.data || [],
      hospitals: hospitalsRes.data || [],
      requests: requestsRes.data || [],
    }
  } catch (err) {
    console.error('❌ Error fetching tables:', err)
    return { donors: [], hospitals: [], requests: [] }
  }
}

export async function subscribeToRealtime() {
  console.log('📡 Setting up realtime subscriptions...')

  const channels = []

  const donorChannel = supabase
    .channel('donors_debug')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, (payload) => {
      console.log('👥 Donor change:', payload.eventType, payload.new || payload.old)
    })
    .subscribe()

  const requestChannel = supabase
    .channel('requests_debug')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, (payload) => {
      console.log('🩸 Request change:', payload.eventType, payload.new || payload.old)
    })
    .subscribe()

  const responseChannel = supabase
    .channel('responses_debug')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'donor_responses' }, (payload) => {
      console.log('📨 Response change:', payload.eventType, payload.new || payload.old)
    })
    .subscribe()

  channels.push(donorChannel, requestChannel, responseChannel)
  console.log('✅ Realtime listeners active')

  return () => {
    channels.forEach(ch => supabase.removeChannel(ch))
    console.log('📴 Realtime listeners removed')
  }
}
