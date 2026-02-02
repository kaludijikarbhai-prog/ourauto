import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/admin/users - Get all users
export async function GET() {
  const supabase = supabaseServer;
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH /api/admin/users - Ban or unban a user
export async function PATCH(req: NextRequest) {
  const { userId, banned } = await req.json();
  const supabase = supabaseServer;
  const { error } = await supabase
    .from('profiles')
    .update({ banned } as any)
    .eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
