/**
 * Referral Card Component
 * Show referral code and earning potential
 */

'use client';

import { useEffect, useState } from 'react';

export default function ReferralCard() {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await fetch('/api/referral');
        const data = await response.json();

        if (data.stats) {
          setStats(data.stats);
          setReferralCode(data.stats.code);
        }
      } catch (err) {
        console.error('Failed to fetch referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(stats?.referralUrl || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg" />;
  }

  if (!stats) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        ⚠️ Failed to load referral details
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-900">🎁 Invite & Earn</h3>
          <p className="text-sm text-green-800 mt-1">
            Share your referral code and earn ₹250 for each dealer who signs up
          </p>
        </div>
        <div className="text-4xl">🤝</div>
      </div>

      {/* Referral Code */}
      <div className="mt-4 rounded-lg bg-white p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">YOUR REFERRAL CODE</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm font-bold text-gray-900"
          />
          <button
            onClick={handleCopyCode}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Share Link */}
      <div className="mt-3 rounded-lg bg-white p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">SHARE LINK</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={stats?.referralUrl}
            readOnly
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-900 overflow-hidden truncate"
          />
          <button
            onClick={handleCopyLink}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalReferrals}</p>
          <p className="text-xs text-gray-600 mt-1">Referrals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.pendingReferrals}</p>
          <p className="text-xs text-gray-600 mt-1">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">₹{(stats.totalBonusEarned / 100).toFixed(0)}</p>
          <p className="text-xs text-gray-600 mt-1">Earned</p>
        </div>
      </div>
    </div>
  );
}
