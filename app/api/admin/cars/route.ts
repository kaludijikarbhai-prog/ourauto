import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/admin/cars - Get all cars
export async function GET() {
  const supabase = supabaseServer;
  const { data } = await supabase.from('cars').select('*');
  return NextResponse.json({ data });
}

// PATCH /api/admin/cars - Set car status
export async function PATCH(req: NextRequest) {
  const { carId, newStatus } = await req.json();
  const supabase = supabaseServer;
  await supabase
    .from('cars')
    .update({ status: newStatus } as { status: string })
    .eq('id', carId);
  return NextResponse.json({ success: true });
}
