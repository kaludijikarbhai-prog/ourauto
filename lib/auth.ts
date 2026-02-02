import { supabase } from './supabase-client';

/**
 * Get the current authenticated user
 */
export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }

  return user;
}

/**
 * Get user session
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }

  return session;
}

/**
 * Sign in with OTP (phone number)
 */
export async function signInWithOtp(phone: string) {
  // Add +91 if not present (India country code)
  const fullPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: fullPhone,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Verify OTP
 */
export async function verifyOtp(phone: string, token: string) {
  // Add +91 if not present
  const fullPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

  const { data, error } = await supabase.auth.verifyOtp({
    phone: fullPhone,
    token,
    type: 'sms',
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return !!user;
}

/**
 * Get user phone number
 */
export async function getUserPhone(): Promise<string | null> {
  const user = await getUser();
  return user?.phone || null;
}

/**
 * Get user ID
 */
export async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) throw new Error("Not authenticated");
  return data.user.id;
}
