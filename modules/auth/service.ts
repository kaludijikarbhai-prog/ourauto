/**
 * Auth Service
 * 
 * Core authentication functions for login, signup, logout
 */

import { supabase } from '@/lib/supabase';
import type { User } from './types';

export async function signUp(email: string, password: string): Promise<User | null> {
  // Using supabase directly
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user as unknown as User;
}

export async function signIn(email: string, password: string): Promise<User | null> {
  // Using supabase directly
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user as unknown as User;
}

export async function signOut(): Promise<void> {
  // Using supabase directly
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // Using supabase directly
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    return null;
  }

  return data.session.user as unknown as User;
}
