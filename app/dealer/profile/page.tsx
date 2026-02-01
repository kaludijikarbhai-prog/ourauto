'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';

export default function DealerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getUser();
    setUser(currentUser);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600 mt-1">{user?.phone}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                  Verified Dealer
                </span>
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user?.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600 mt-1">✓ Active</p>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Plan</h2>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Current Plan</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">Professional</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Up to 50 active listings • Lead priority • Analytics
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Account Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Member Since</p>
                  <p className="text-xl font-bold text-blue-900 mt-2">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Commission Rate</p>
                  <p className="text-xl font-bold text-purple-900 mt-2">2%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Wallet Balance</p>
                  <p className="text-xl font-bold text-green-900 mt-2">₹0</p>
                </div>
              </div>
            </div>

            {/* KYC */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">KYC Information</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-green-900">KYC Verified</p>
                  <p className="text-sm text-green-700">Your account is fully verified and approved.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition">
              Edit Profile
            </button>
            <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
