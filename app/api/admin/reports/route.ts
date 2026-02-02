
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/admin/reports - Get all reports
export async function GET() {
  const { data, error } = await supabaseServer.from('reports').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH /api/admin/reports - Resolve or dismiss a report
export async function PATCH(req: NextRequest) {
  const { reportId, status } = await req.json();
  const { error } = await supabaseServer
    .from('reports')
    .update({ status } as any)
    .eq('id', reportId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
