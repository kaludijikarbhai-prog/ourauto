'use client';

import { useEffect, useState } from 'react';
import {
  getDealerLeads,
  updateLeadStatus,
  getLeadStats,
  getDealerCars,
} from '@/lib/dealer';
import { DealerLeadWithDetails, Car, LeadStatus } from '@/lib/types';
import { StatsCard } from '@/components/dealer/StatsCard';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const [leads, setLeads] = useState<DealerLeadWithDetails[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [leadsData, carsData, statsData] = await Promise.all([
      getDealerLeads(),
      getDealerCars(),
      getLeadStats(),
    ]);
    setLeads(leadsData.slice(0, 5)); // Recent 5 leads
    setCars(carsData);
    setStats(statsData);
    setLoading(false);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLeadStatus(leadId, newStatus);
    await loadData();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          label="Total Cars"
          value={cars.length}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 7a2 2 0 100-4H8m0 4v10m0-10H4a2 2 0 100 4h4m8 0a2 2 0 100 4m0-4v10m0-10l4-4" />
            </svg>
          }
        />

        <StatsCard
          label="Active Listings"
          value={cars.filter((c) => c.status === 'live').length}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatsCard
          label="Total Leads"
          value={stats.total}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zM5 20h10a2 2 0 002-2v-2a6 6 0 00-6-6H5a6 6 0 00-6 6v2a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatsCard
          label="Conversion"
          value={`${stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%`}
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <StatsCard
          label="Revenue (Potential)"
          value={formatPrice(cars.reduce((sum, c) => sum + (c.price || 0), 0) * 0.02)} // 2% commission
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Lead Status Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">New</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.new}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Contacted</p>
            <p className="text-2xl font-bold text-yellow-700 mt-2">{stats.contacted}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Interested</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">{stats.interested}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Closed</p>
            <p className="text-2xl font-bold text-green-700 mt-2">{stats.closed}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-700 mt-2">{stats.new + stats.contacted + stats.interested}</p>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
          <Link href="/dealer/leads" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View all →
          </Link>
        </div>
        {leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No leads yet. Your inquiries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div>
                  <p className="font-semibold text-gray-900">
                    {lead.car.year} {lead.car.brand} {lead.car.model}
                  </p>
                  <p className="text-sm text-gray-600">{formatPrice(lead.car.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      lead.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : lead.status === 'contacted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : lead.status === 'interested'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {lead.status}
                  </span>
                  {lead.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(lead.id, 'contacted')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                    >
                      Contact
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/sell"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Add New Car</h3>
              <p className="text-blue-100 text-sm mt-1">List a new vehicle</p>
            </div>
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>

        <Link
          href="/dealer/leads"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Manage Leads</h3>
              <p className="text-purple-100 text-sm mt-1">Track all inquiries</p>
            </div>
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </Link>

        <Link
          href="/dealer/listings"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">My Inventory</h3>
              <p className="text-green-100 text-sm mt-1">{cars.length} cars listed</p>
            </div>
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
