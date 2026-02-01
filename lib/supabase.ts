import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug logging
if (typeof window === 'undefined') {
  console.log('✓ SUPABASE_URL loaded:', supabaseUrl ? '✅' : '❌')
  console.log('✓ SUPABASE_KEY loaded:', supabaseAnonKey ? '✅' : '❌')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env missing - check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
