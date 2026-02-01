/**
 * Backup Management Component
 * View and manage database backups
 */

'use client';

import { useEffect, useState } from 'react';
import { getBackupHistory, getLastBackupDate, checkDatabaseIntegrity } from '@/lib/backup-service';
import type { BackupJob } from '@/lib/backup-service';

export default function BackupManagement() {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backupHistory = await getBackupHistory(20);
        const lastBackup = await getLastBackupDate();
        const healthCheck = await checkDatabaseIntegrity();
        
        setBackups(backupHistory);
        setLastBackupDate(lastBackup);
        setHealth(healthCheck);
      } catch (err) {
        console.error('Failed to fetch backup data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg" />;
  }

  const daysAgoLastBackup = lastBackupDate
    ? Math.floor((Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Database Health */}
      <div className={`rounded-lg border-2 p-6 ${health?.healthy ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {health?.healthy ? '✓ Database Healthy' : '⚠️ Database Issues Detected'}
            </h3>
            {health?.errors && health.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {health.errors.map((err: string, i: number) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            )}
          </div>
          <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
            Run Check
          </button>
        </div>
      </div>

      {/* Last Backup Status */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Last Backup</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Last backup:</p>
            <p className="font-semibold text-gray-900">
              {lastBackupDate
                ? `${daysAgoLastBackup} day${daysAgoLastBackup !== 1 ? 's' : ''} ago`
                : 'No backups yet'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Status:</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              daysAgoLastBackup && daysAgoLastBackup < 1
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {daysAgoLastBackup && daysAgoLastBackup < 1 ? '✓ Current' : '⚠️ Stale'}
            </span>
          </div>
          <button className="w-full rounded-lg bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700 mt-4">
            🔄 Start Backup Now
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Backup History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Size</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {backup.backup_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {backup.file_size ? `${(backup.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(backup.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {backup.status === 'completed' && backup.file_url ? (
                      <a href={backup.file_url} download className="text-blue-600 hover:underline text-sm">
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-Backup Schedule */}
      <div className="rounded-lg border border-gray-200 p-6 bg-blue-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⏰ Auto-Backup Schedule</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Frequency:</p>
            <p className="font-semibold text-gray-900">Daily at 2:00 AM UTC</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Retention:</p>
            <p className="font-semibold text-gray-900">30 days</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Status:</p>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
