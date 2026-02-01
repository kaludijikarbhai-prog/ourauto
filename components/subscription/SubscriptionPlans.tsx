/**
 * Subscription Plans Component
 * Display plans and allow tier switching
 */

'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-service';
import type { SubscriptionTier } from '@/lib/subscription-service';

interface SubscriptionPlansProps {
  currentTier?: SubscriptionTier;
  onUpgrade?: (tier: SubscriptionTier) => Promise<void>;
}

export default function SubscriptionPlans({
  currentTier = 'free',
  onUpgrade,
}: SubscriptionPlansProps) {
  const [upgrading, setUpgrading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === currentTier) return;

    try {
      setUpgrading(tier);
      setError(null);

      if (onUpgrade) {
        await onUpgrade(tier);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Upgrade anytime to unlock more features</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([tierKey, plan]) => (
          <div
            key={tierKey}
            className={`rounded-lg border-2 p-6 transition-all ${
              currentTier === tierKey
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {currentTier === tierKey && (
              <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                ✓ Current Plan
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-900">
                {plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-600">{plan.monthlyPrice > 0 ? '/month' : 'Forever'}</p>
            </div>

            {/* Features */}
            <ul className="mt-6 space-y-3">
              <li className={`flex items-center gap-2 text-sm ${plan.maxListings > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={plan.maxListings > 0 ? '✓' : '✗'}>  </span>
                {plan.maxListings} listings
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.maxFeaturedListings > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={plan.maxFeaturedListings > 0 ? '✓' : '✗'}></span>
                {plan.maxFeaturedListings} featured listings
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.leads24HourLocks > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={plan.leads24HourLocks > 0 ? '✓' : '✗'}></span>
                {plan.leads24HourLocks} lead locks/day
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.chatMessages > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={plan.chatMessages > 0 ? '✓' : '✗'}></span>
                {plan.chatMessages} messages/day
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.analyticsAccess ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={plan.analyticsAccess ? '✓' : '✗'}></span>
                Analytics {plan.analyticsAccess ? '' : '(Coming)'}
              </li>
              <li className={`flex items-center gap-2 text-sm ${plan.prioritySupport ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={plan.prioritySupport ? '✓' : '✗'}></span>
                Priority support {plan.prioritySupport ? '' : '(Coming)'}
              </li>
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleUpgrade(plan.tier as SubscriptionTier)}
              disabled={currentTier === plan.tier || upgrading === plan.tier}
              className={`w-full mt-6 rounded-lg font-semibold py-2 transition-all ${
                currentTier === plan.tier
                  ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${upgrading === plan.tier ? 'opacity-50' : ''}`}
            >
              {currentTier === plan.tier
                ? 'Current'
                : upgrading === plan.tier
                ? 'Processing...'
                : plan.monthlyPrice === 0
                ? 'Downgrade'
                : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
