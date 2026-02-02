/**
 * Auth Service
 * 
 * Core authentication functions for login, signup, logout
 */


import { supabaseServer } from '@/lib/supabase-server';
import type { User } from './types';

export async function signUp(email: string, password: string): Promise<User> {
  const { data, error } = await supabaseServer.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.user) {
    throw new Error('No user returned from signUp');
  }
  return data.user as unknown as User;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.user) {
    throw new Error('No user returned from signIn');
  }
  return data.user as unknown as User;
}

export async function signOut(): Promise<void> {
  const { error } = await supabaseServer.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getSessionUser(): Promise<User | null> {
  const { data, error } = await supabaseServer.auth.getSession();
  if (error || !data.session?.user) {
    return null;
  }
  return data.session.user as unknown as User;
}
