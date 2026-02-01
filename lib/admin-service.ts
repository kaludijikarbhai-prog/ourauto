import { supabase } from "./supabase"

/* ============== AUTH ============== */

export const isAdmin = async () => {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  
  return profile?.role === "admin"
}

/* ============== USERS ============== */

export const getAllUsers = () =>
  supabase().from("profiles").select("*")

export const banUser = (id: string) =>
  supabase().from("profiles").update({ banned: true }).eq("id", id)

export const unbanUser = (id: string) =>
  supabase().from("profiles").update({ banned: false }).eq("id", id)

/* ============== DEALERS ============== */

export const getDealers = () => {
  return supabase().from("profiles").select("*").eq("role", "dealer")
}


export async function getAllDealerProfiles() {
  const { data, error } = await supabase().from("dealer_profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function approveDealer(id: string) {
  const { error } = await supabase().from("dealer_profiles").update({ status: "approved", verified: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function rejectDealer(id: string) {
  const { error } = await supabase().from("dealer_profiles").update({ status: "rejected", verified: false }).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ============== CARS ============== */

export const getAllCars = () =>
  supabase.from("cars").select("*")

export const setCarStatus = (id: string, status: string) =>
  supabase.from("cars").update({ status }).eq("id", id)

/* ============== LISTINGS ============== */

export const getAllListings = () =>
  supabase.from("cars").select("*")

export const deleteListing = (id: string) =>
  supabase.from("cars").delete().eq("id", id)

/* ============== REPORTS ============== */

export const getAllReports = () =>
  supabase.from("reports").select("*")

export const resolveReport = (id: string, status: string) =>
  supabase.from("reports").update({ status }).eq("id", id)

/* ============== STATS ============== */

export const getStats = async () => {
  const { count: users } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: cars } = await supabase
    .from("cars")
    .select("*", { count: "exact", head: true })

  const { count: dealers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "dealer")

  return { users: users || 0, cars: cars || 0, dealers: dealers || 0 }
}
