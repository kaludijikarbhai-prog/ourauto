'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getUserPhone } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const phone = await getUserPhone();
        setUserPhone(phone);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OurAuto</h1>
            <p className="text-sm text-gray-600 mt-1">Dealer Panel</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-md transition duration-200"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to OurAuto Dealer Panel</h2>
          <p className="text-lg text-gray-600">Manage your vehicle listings, leads, and inspections all in one place.</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phone */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Phone Number</p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">📱</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{userPhone ? `+91 ${userPhone}` : 'Loading...'}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Account Status</p>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List Car */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">List a Vehicle</h3>
            <p className="text-gray-600 text-sm mb-6">Add a new vehicle to your inventory</p>
            <a
              href="/dashboard/cars/new"
              className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition"
            >
              List Now
            </a>
          </div>

          {/* View Leads */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-8">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Leads</h3>
            <p className="text-gray-600 text-sm mb-6">Check customer interest in your vehicles</p>
            <a
              href="/dashboard/leads"
              className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition"
            >
              View Leads
            </a>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-8">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600 text-sm mb-6">Chat with potential buyers</p>
            <a
              href="/dashboard/messages"
              className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition"
            >
              Open Chat
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🤖',
                title: 'AI Valuation',
                description: 'Upload car photos for instant AI pricing',
              },
              {
                icon: '🔍',
                title: 'Inspection Booking',
                description: 'Schedule professional vehicle inspections',
              },
              {
                icon: '📱',
                title: 'Easy OTP Login',
                description: 'Secure login with phone number verification',
              },
              {
                icon: '⚡',
                title: 'Real-time Updates',
                description: 'Instant notifications for leads and messages',
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl mb-3">{feature.icon}</p>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
