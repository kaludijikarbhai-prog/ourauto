/**
 * Wallet Display Component
 * Shows balance, transactions, and credit management
 */

'use client';

import { useEffect, useState } from 'react';
import type { Wallet, WalletTransaction } from '@/lib/wallet-service';

export default function WalletDisplay() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        // This would be called via API in production
        // For now, we'll fetch via API route
        const response = await fetch('/api/wallet');
        const data = await response.json();

        if (data.wallet) {
          setWallet(data.wallet);
        }
        if (data.stats?.lastTransaction) {
          setTransactions([data.stats.lastTransaction]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  if (error || !wallet) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        ⚠️ Failed to load wallet: {error}
      </div>
    );
  }

  const balanceInRupees = (wallet.balance / 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
        <p className="text-sm opacity-90">Wallet Balance</p>
        <h2 className="text-4xl font-bold mt-2">₹{balanceInRupees}</h2>
        <p className="text-xs opacity-75 mt-2">
          Earned: ₹{(wallet.total_earned / 100).toFixed(2)} • Spent: ₹{(wallet.total_spent / 100).toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="rounded-lg border-2 border-blue-500 bg-white px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50">
          💰 Add Credit
        </button>
        <button className="rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          📋 History
        </button>
      </div>

      {/* Recent Transaction */}
      {transactions.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Last Transaction</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {transactions[0].description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(transactions[0].created_at).toLocaleDateString()}
              </p>
            </div>
            <p className={`text-sm font-bold ${transactions[0].amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transactions[0].amount > 0 ? '+' : '-'}₹{Math.abs(transactions[0].amount / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
