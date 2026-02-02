
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = supabaseServer
  const { userId, verified } = await req.json()
  await supabase
    .from('profiles')
    .update({ verified } as { verified: boolean })
    .eq('id', userId)
  return NextResponse.json({ success: true })
}
