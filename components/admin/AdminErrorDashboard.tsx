/**
 * Admin Error Dashboard Component
 * Monitor errors and system health
 */

'use client';

import { useEffect, useState } from 'react';
import { getCriticalErrors, getErrorStats } from '@/lib/error-logging-service';
import type { ErrorLog } from '@/lib/error-logging-service';

export default function AdminErrorDashboard() {
  const [criticalErrors, setCriticalErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const critical = await getCriticalErrors(10);
        const errorStats = await getErrorStats(7);
        
        setCriticalErrors(critical);
        setStats(errorStats);
      } catch (err) {
        console.error('Failed to fetch error data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Errors</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalErrors || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Critical</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats?.criticalErrors || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Require attention</p>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Unresolved</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.unresolvedErrors || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Pending resolution</p>
        </div>

        <div className="rounded-lg bg-green-50 p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Resolved Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats?.totalErrors > 0
              ? Math.round(((stats?.totalErrors - stats?.unresolvedErrors) / stats?.totalErrors) * 100)
              : 100}
            %
          </p>
          <p className="text-xs text-gray-500 mt-1">This week</p>
        </div>
      </div>

      {/* Critical Errors List */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🚨 Critical Errors</h3>

        {criticalErrors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ✓ No critical errors! System is healthy.
          </div>
        ) : (
          <div className="space-y-3">
            {criticalErrors.map((error) => (
              <div
                key={error.id}
                className="rounded-lg bg-red-50 border border-red-200 p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">{error.error_type}</p>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded">
                        {error.category}
                      </span>
                      <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                        {new Date(error.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Categories */}
      {stats?.errorsByCategory && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Errors by Category</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(stats.errorsByCategory).map(([category, count]: [string, unknown]) => (
              <div key={category} className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600 capitalize">{category}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{String(count)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
