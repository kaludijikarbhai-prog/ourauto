'use client';

import { useEffect, useState } from 'react';
import { getDealerLeads, updateLeadStatus } from '@/lib/dealer';
import { DealerLeadWithDetails, LeadStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function DealerLeadsPage() {
  const [leads, setLeads] = useState<DealerLeadWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const data = await getDealerLeads();
    setLeads(data);
    setLoading(false);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLeadStatus(leadId, newStatus);
    await loadLeads();
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    interested: leads.filter((l) => l.status === 'interested').length,
    closed: leads.filter((l) => l.status === 'closed').length,
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'interested':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all buyer inquiries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">New</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">Contacted</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-purple-600">Interested</p>
            <p className="text-2xl font-bold text-purple-600">{stats.interested}</p>
          </div>
          <div className="bg-gray-100 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.closed}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['all', 'new', 'contacted', 'interested', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({filter === 'all' && s === 'all' ? stats.total : filter === s ? filteredLeads.length : stats[s as keyof typeof stats]})
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-600">
            {filter === 'all' ? 'No leads yet. Leads from buyers will appear here.' : `No ${filter} leads`}
          </div>
        ) : (
          /* Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Inspection
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    {/* Car */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {lead.car.year} {lead.car.brand} {lead.car.model}
                        </p>
                        <p className="text-xs text-gray-600">{lead.car.city}</p>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatPrice(lead.car.price)}
                    </td>

                    {/* Inspection */}
                    <td className="px-6 py-4 text-sm">
                      {lead.inspection ? (
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(lead.inspection.date).toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-600">{lead.inspection.time_slot}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">No inspection booked</p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(lead.created_at).toLocaleDateString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 space-y-1">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'contacted')}
                          className="block text-blue-600 hover:text-blue-700 font-semibold text-xs"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {lead.status === 'contacted' && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'interested')}
                          className="block text-purple-600 hover:text-purple-700 font-semibold text-xs"
                        >
                          Mark Interested
                        </button>
                      )}
                      {lead.status !== 'closed' && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'closed')}
                          className="block text-gray-600 hover:text-gray-700 font-semibold text-xs"
                        >
                          Close Lead
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
