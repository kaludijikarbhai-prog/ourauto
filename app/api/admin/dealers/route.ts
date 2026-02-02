
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = supabaseServer
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'dealer')
  return NextResponse.json(data)
}
