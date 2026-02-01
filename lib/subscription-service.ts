/**
 * Subscription Service - Dealer subscription tiers
 * Free / Pro / Premium with different features
 */

import { supabase } from './supabase';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number; // in rupees
  maxListings: number;
  maxFeaturedListings: number;
  leads24HourLocks: number;
  chatMessages: number; // per day
  analyticsAccess: boolean;
  prioritySupport: boolean;
  customWatermark: boolean;
  auctionAccess: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Starter',
    monthlyPrice: 0,
    maxListings: 10,
    maxFeaturedListings: 0,
    leads24HourLocks: 3,
    chatMessages: 20,
    analyticsAccess: false,
    prioritySupport: false,
    customWatermark: false,
    auctionAccess: false,
  },
  pro: {
    tier: 'pro',
    name: 'Professional',
    monthlyPrice: 4999, // ₹4,999
    maxListings: 100,
    maxFeaturedListings: 5,
    leads24HourLocks: 50,
    chatMessages: 500,
    analyticsAccess: true,
    prioritySupport: true,
    customWatermark: false,
    auctionAccess: false,
  },
  premium: {
    tier: 'premium',
    name: 'Enterprise',
    monthlyPrice: 9999, // ₹9,999
    maxListings: 500,
    maxFeaturedListings: 50,
    leads24HourLocks: 999,
    chatMessages: 9999,
    analyticsAccess: true,
    prioritySupport: true,
    customWatermark: true,
    auctionAccess: true,
  },
};

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get user's current subscription
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Subscription | null;
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
}

/**
 * Get user's subscription plan details
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    const subscription = await getSubscription(userId);
    const tier = subscription?.tier || 'free';
    return SUBSCRIPTION_PLANS[tier];
  } catch (error) {
    console.error('Failed to get user plan:', error);
    return SUBSCRIPTION_PLANS.free;
  }
}

/**
 * Create subscription
 */
export async function createSubscription(
  userId: string,
  tier: SubscriptionTier,
  durationDays: number = 30
): Promise<Subscription> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Subscription;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw error;
  }
}

/**
 * Upgrade subscription tier
 */
export async function upgradeSubscription(
  userId: string,
  newTier: SubscriptionTier
): Promise<Subscription> {
  try {
    const currentSubscription = await getSubscription(userId);

    // Cancel old subscription
    if (currentSubscription) {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', currentSubscription.id);
    }

    // Create new subscription (same expiry)
    const durationDays = currentSubscription
      ? Math.ceil(
          (new Date(currentSubscription.expires_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : 30;

    return await createSubscription(userId, newTier, Math.max(durationDays, 1));
  } catch (error) {
    console.error('Failed to upgrade subscription:', error);
    throw error;
  }
}

/**
 * Downgrade subscription tier
 */
export async function downgradeSubscription(
  userId: string,
  newTier: SubscriptionTier
): Promise<Subscription> {
  // Same as upgrade, just with different tier
  return upgradeSubscription(userId, newTier);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string): Promise<void> {
  try {
    const subscription = await getSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id);
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
}

/**
 * Renew subscription automatically
 */
export async function renewSubscription(userId: string): Promise<Subscription> {
  try {
    const currentSubscription = await getSubscription(userId);
    if (!currentSubscription) {
      throw new Error('No subscription to renew');
    }

    // Extend current subscription by 30 days
    const newExpiresAt = new Date(
      new Date(currentSubscription.expires_at).getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSubscription.id)
      .select()
      .single();

    if (error) throw error;
    return data as Subscription;
  } catch (error) {
    console.error('Failed to renew subscription:', error);
    throw error;
  }
}

/**
 * Check if user can perform action
 * Returns true if they have access
 */
export async function canPerformAction(
  userId: string,
  action: keyof SubscriptionPlan
): Promise<boolean> {
  try {
    const plan = await getUserPlan(userId);
    const allowed = plan[action];
    return Boolean(allowed);
  } catch (error) {
    console.error('Failed to check action permission:', error);
    return false;
  }
}

/**
 * Check listing limit
 */
export async function checkListingLimit(userId: string): Promise<{
  current: number;
  limit: number;
  canAddMore: boolean;
}> {
  try {
    const plan = await getUserPlan(userId);

    // Get current listings count
    const { count, error } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'live');

    if (error) throw error;

    const current = count || 0;
    const limit = plan.maxListings;

    return {
      current,
      limit,
      canAddMore: current < limit,
    };
  } catch (error) {
    console.error('Failed to check listing limit:', error);
    throw error;
  }
}

/**
 * Get subscription details for display
 */
export async function getSubscriptionDetails(userId: string): Promise<{
  plan: SubscriptionPlan;
  subscription: Subscription | null;
  daysRemaining: number;
  isExpiring: boolean;
}> {
  try {
    const plan = await getUserPlan(userId);
    const subscription = await getSubscription(userId);

    const daysRemaining = subscription
      ? Math.ceil(
          (new Date(subscription.expires_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      plan,
      subscription,
      daysRemaining,
      isExpiring: daysRemaining < 7 && daysRemaining > 0,
    };
  } catch (error) {
    console.error('Failed to get subscription details:', error);
    throw error;
  }
}
