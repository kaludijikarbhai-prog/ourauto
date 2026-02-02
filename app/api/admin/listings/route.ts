import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = supabaseServer
  const { data } = await supabase
    .from('cars')
    .select('*')
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { id } = await req.json()
  const supabase = supabaseServer
  await supabase
    .from('cars')
    .update({ status: 'approved' } as { status: string })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
