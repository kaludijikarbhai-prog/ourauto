import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const token = req.cookies.get("sb-access-token")?.value

  if (!token) return NextResponse.next()

  const {
    data: { user },
  } = await supabase.auth.getUser(token)

  if (!user) return NextResponse.next()

  const { data } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", user.id)
    .single()

  if (data?.banned) {
    return NextResponse.redirect(new URL("/banned", req.url))
  }

  return NextResponse.next()
}
