import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim() || ''
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY?.trim() || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase client warning: missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_PUBLISHABLE_KEY.\n' +
    'Please verify your .env file and restart the app.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseConfig = { url: supabaseUrl, key: supabaseKey }
