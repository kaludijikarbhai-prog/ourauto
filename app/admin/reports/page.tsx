'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// All server logic moved to API route
import { Report } from '@/lib/types';

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'dismissed'>('all');

  useEffect(() => {
    checkAndLoad();
  }, []);

  const checkAndLoad = async () => {
    setLoading(true);
    // Check admin status via API (could be improved with auth headers)
    const res = await fetch('/api/admin/verify');
    const admin = await res.json();
    if (!admin?.isAdmin) {
      router.push('/home');
      return;
    }

    setAuthorized(true);
    // Fetch all reports
    const reportsRes = await fetch('/api/admin/reports');
    const data = await reportsRes.json();
    setReports(data.data || []);
    setLoading(false);
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status }),
    });
    setReports(reports.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  const filteredReports =
    filter === 'all'
      ? reports
      : reports.filter((r) => r.status === (filter === 'open' ? 'open' : filter));

  const stats = {
    total: reports.length,
    open: reports.filter((r) => r.status === 'open').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'inappropriate':
        return 'bg-red-100 text-red-800';
      case 'spam':
        return 'bg-yellow-100 text-yellow-800';
      case 'fraud':
        return 'bg-red-200 text-red-900';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!authorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
          <p className="text-gray-600 mt-2">Total reports: {reports.length}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-red-600">Open</p>
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-gray-100 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Dismissed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.dismissed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['all', 'open', 'resolved', 'dismissed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-600">
            No {filter === 'all' ? '' : filter} reports.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Reported
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    {/* Reason */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getReasonColor(report.reason)}`}>
                        {report.reason}
                      </span>
                    </td>

                    {/* Entity Type */}
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {report.entity_type}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          report.status === 'open'
                            ? 'bg-red-100 text-red-800'
                            : report.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>

                    {/* Reported */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 space-y-1">
                      {report.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleResolveReport(report.id, 'resolved')}
                            className="block text-green-600 hover:text-green-800 font-semibold text-xs"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'dismissed')}
                            className="block text-gray-600 hover:text-gray-800 font-semibold text-xs"
                          >
                            Dismiss
                          </button>
                        </>
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
