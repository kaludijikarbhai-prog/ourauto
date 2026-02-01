/**
 * Backup Service
 * Auto-backup data and CSV export functionality
 */

import { supabase } from './supabase';

export interface BackupJob {
  id: string;
  backup_type: 'full' | 'cars' | 'users' | 'transactions';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * Create full database backup
 */
export async function createFullBackup(): Promise<BackupJob> {
  try {
    // Note: In production, use Supabase's backup API
    // https://supabase.com/docs/guides/platform/backups

    const { data, error } = await supabase
      .from('backup_jobs')
      .insert({
        backup_type: 'full',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as BackupJob;
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw error;
  }
}

/**
 * Export cars data to CSV
 */
export async function exportCarsToCSV(): Promise<Blob> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to CSV
    const csv = convertToCSV(data || []);
    return new Blob([csv], { type: 'text/csv' });
  } catch (error) {
    console.error('Failed to export cars:', error);
    throw error;
  }
}

/**
 * Export transactions to CSV (admin audit)
 */
export async function exportTransactionsToCSV(): Promise<Blob> {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const csv = convertToCSV(data || []);
    return new Blob([csv], { type: 'text/csv' });
  } catch (error) {
    console.error('Failed to export transactions:', error);
    throw error;
  }
}

/**
 * Export users to CSV
 */
export async function exportUsersToCSV(): Promise<Blob> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const csv = convertToCSV(data || []);
    return new Blob([csv], { type: 'text/csv' });
  } catch (error) {
    console.error('Failed to export users:', error);
    throw error;
  }
}

/**
 * Get backup history
 */
export async function getBackupHistory(limit: number = 20): Promise<BackupJob[]> {
  try {
    const { data, error } = await supabase
      .from('backup_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as BackupJob[];
  } catch (error) {
    console.error('Failed to fetch backup history:', error);
    return [];
  }
}

/**
 * Check last backup date
 */
export async function getLastBackupDate(): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('backup_jobs')
      .select('completed_at')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data?.completed_at ? new Date(data.completed_at) : null;
  } catch (error) {
    console.error('Failed to get last backup date:', error);
    return null;
  }
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const headerRow = headers.map((h) => `"${h}"`).join(',');

  // Convert rows
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return String(value);
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Download backup file
 */
export async function downloadBackupFile(backupId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('backup_jobs')
      .select('file_url')
      .eq('id', backupId)
      .single();

    if (error || !data?.file_url) throw new Error('Backup file not found');

    // Open download
    window.open(data.file_url, '_blank');
  } catch (error) {
    console.error('Failed to download backup:', error);
    throw error;
  }
}

/**
 * Enable automatic daily backups (config)
 */
export const BACKUP_CONFIG = {
  enabled: true,
  schedule: 'daily', // 'daily' | 'weekly' | 'monthly'
  time: '02:00', // UTC time
  retention: 30, // days
};

/**
 * Database integrity check
 */
export async function checkDatabaseIntegrity(): Promise<{
  healthy: boolean;
  errors: string[];
  checks: Record<string, boolean>;
}> {
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];

  try {
    // Check cars table
    const { count: carsCount, error: carsError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });

    checks['cars'] = !carsError && carsCount !== null;
    if (carsError) errors.push(`Cars table: ${carsError.message}`);

    // Check profiles table
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    checks['profiles'] = !profilesError && profilesCount !== null;
    if (profilesError) errors.push(`Profiles table: ${profilesError.message}`);

    // Check wallets table
    const { count: walletsCount, error: walletsError } = await supabase
      .from('wallets')
      .select('*', { count: 'exact', head: true });

    checks['wallets'] = !walletsError && walletsCount !== null;
    if (walletsError) errors.push(`Wallets table: ${walletsError.message}`);

    // Check subscriptions table
    const { count: subsCount, error: subsError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    checks['subscriptions'] = !subsError && subsCount !== null;
    if (subsError) errors.push(`Subscriptions table: ${subsError.message}`);

    return {
      healthy: errors.length === 0,
      errors,
      checks,
    };
  } catch (error) {
    console.error('Database integrity check failed:', error);
    return {
      healthy: false,
      errors: [String(error)],
      checks,
    };
  }
}
