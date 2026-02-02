import { NextResponse } from 'next/server'
import { createInspectionBooking } from '@/lib/inspection-booking'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    await createInspectionBooking(body)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
