import { supabase } from "@/lib/supabase-client";

export async function validateCoupon(code: string): Promise<{ valid: boolean; message?: string }> {
  if (!code) return { valid: false, message: "Coupon code required." };
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !data) return { valid: false, message: "Coupon not found." };
  if (!data.active) return { valid: false, message: "Coupon is not active." };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, message: "Coupon expired." };
  if (data.used_count >= data.max_usage) return { valid: false, message: "Coupon usage limit reached." };
  return { valid: true };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  await supabase.rpc("increment_coupon_usage", { coupon_code: code });
}
