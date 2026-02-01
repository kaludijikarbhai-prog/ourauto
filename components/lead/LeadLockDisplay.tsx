/**
 * Lead Lock Component
 * Shows lead lock status and dealer information
 */

'use client';

import { useState, useEffect } from 'react';
import { getActiveLock, lockLead, releaseLead } from '@/lib/lead-lock-service';
import type { LeadLockWithDealerInfo } from '@/lib/lead-lock-service';

interface LeadLockDisplayProps {
  carId: string;
  isDealerUser: boolean;
  currentUserId?: string;
}

export default function LeadLockDisplay({
  carId,
  isDealerUser,
  currentUserId,
}: LeadLockDisplayProps) {
  const [activeLock, setActiveLock] = useState<LeadLockWithDealerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLock = async () => {
      try {
        setLoading(true);
        const lock = await getActiveLock(carId);
        setActiveLock(lock);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkLock();
    // Refresh every 30 seconds
    const interval = setInterval(checkLock, 30000);
    return () => clearInterval(interval);
  }, [carId]);

  const handleLockLead = async () => {
    if (!isDealerUser || !currentUserId) {
      setError('Only dealers can lock leads');
      return;
    }

    try {
      setLocking(true);
      const lock = await lockLead(carId, currentUserId, 'interested', 24);
      setActiveLock(lock as any);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLocking(false);
    }
  };

  const handleReleaseLead = async () => {
    if (!activeLock) return;

    try {
      setLocking(true);
      await releaseLead(activeLock.id, currentUserId!);
      setActiveLock(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-600">
        Checking lead status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (activeLock && activeLock.dealer_id !== currentUserId) {
    // Lead is locked by another dealer
    const expiresIn = new Date(activeLock.expires_at);
    const hoursLeft = Math.ceil(
      (expiresIn.getTime() - Date.now()) / (1000 * 60 * 60)
    );

    return (
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900">Lead is Locked</h4>
            <p className="text-sm text-amber-800 mt-1">
              <strong>{activeLock.dealer_name}</strong> from {activeLock.dealer_city} has locked this lead.
            </p>
            <p className="text-xs text-amber-700 mt-2">
              Available again in {hoursLeft} hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeLock && activeLock.dealer_id === currentUserId) {
    // Current dealer has this lock
    const expiresIn = new Date(activeLock.expires_at);
    const hoursLeft = Math.ceil(
      (expiresIn.getTime() - Date.now()) / (1000 * 60 * 60)
    );

    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">✓ You Own This Lead</h4>
            <p className="text-sm text-green-800 mt-1">
              Locked for <strong>{hoursLeft} hours</strong> • Other dealers cannot contact this buyer
            </p>
          </div>
          <button
            onClick={handleReleaseLead}
            disabled={locking}
            className="ml-4 whitespace-nowrap rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {locking ? 'Releasing...' : 'Release'}
          </button>
        </div>
      </div>
    );
  }

  // Lead is available
  return (
    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-green-900">✓ Lead Available</h4>
          <p className="text-sm text-green-800 mt-1">
            {isDealerUser
              ? 'Lock this lead to prevent other dealers from contacting this buyer'
              : 'Dealers can claim exclusive contact rights for 24 hours'}
          </p>
        </div>
        {isDealerUser && (
          <button
            onClick={handleLockLead}
            disabled={locking}
            className="ml-4 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {locking ? 'Locking...' : '🔒 Lock Lead (24h)'}
          </button>
        )}
      </div>
    </div>
  );
}
