import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
// Accept both naming conventions for backward compatibility
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) are set in .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')
