/**
 * Error Handling & Logging Service
 * Enterprise-grade error tracking and logging
 */

import { supabase } from './supabase';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'auth' | 'payment' | 'database' | 'api' | 'validation' | 'unknown';

export interface ErrorLog {
  id: string;
  user_id?: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: Record<string, any>;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

/**
 * Log error to database
 */
export async function logError(
  error: Error | string,
  options: {
    userId?: string;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    context?: Record<string, any>;
  } = {}
): Promise<ErrorLog> {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    const { data, error: dbError } = await supabase
      .from('error_logs')
      .insert({
        user_id: options.userId,
        error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
        message: errorMessage,
        stack_trace: stackTrace,
        severity: options.severity || 'medium',
        category: options.category || 'unknown',
        context: options.context,
        resolved: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to log error:', dbError);
      // Still return a local error log
      return {
        id: 'local-' + Date.now(),
        error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
        message: errorMessage,
        stack_trace: stackTrace,
        severity: options.severity || 'medium',
        category: options.category || 'unknown',
        context: options.context,
        resolved: false,
        created_at: new Date().toISOString(),
      };
    }

    return data as ErrorLog;
  } catch (err) {
    console.error('Error logging system failed:', err);
    throw err;
  }
}

/**
 * Get all unresolved errors (admin view)
 */
export async function getUnresolvedErrors(limit: number = 100): Promise<ErrorLog[]> {
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ErrorLog[];
  } catch (error) {
    console.error('Failed to fetch unresolved errors:', error);
    return [];
  }
}

/**
 * Get errors by category
 */
export async function getErrorsByCategory(
  category: ErrorCategory,
  limit: number = 50
): Promise<ErrorLog[]> {
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ErrorLog[];
  } catch (error) {
    console.error('Failed to fetch errors by category:', error);
    return [];
  }
}

/**
 * Get critical errors
 */
export async function getCriticalErrors(limit: number = 50): Promise<ErrorLog[]> {
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('severity', 'critical')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ErrorLog[];
  } catch (error) {
    console.error('Failed to fetch critical errors:', error);
    return [];
  }
}

/**
 * Mark error as resolved
 */
export async function resolveError(errorId: string, notes: string = ''): Promise<void> {
  try {
    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq('id', errorId);

    if (error) throw error;
  } catch (err) {
    console.error('Failed to resolve error:', err);
    throw err;
  }
}

/**
 * Get error statistics
 */
export async function getErrorStats(days: number = 7): Promise<{
  totalErrors: number;
  criticalErrors: number;
  unresolvedErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
}> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', sinceDate.toISOString());

    if (error) throw error;

    const errors = data as ErrorLog[];

    const stats = {
      totalErrors: errors.length,
      criticalErrors: errors.filter((e) => e.severity === 'critical').length,
      unresolvedErrors: errors.filter((e) => !e.resolved).length,
      errorsByCategory: {} as Record<string, number>,
      errorsBySeverity: {} as Record<string, number>,
    };

    // Count by category
    errors.forEach((e) => {
      stats.errorsByCategory[e.category] = (stats.errorsByCategory[e.category] || 0) + 1;
      stats.errorsBySeverity[e.severity] = (stats.errorsBySeverity[e.severity] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Failed to get error stats:', error);
    throw error;
  }
}

/**
 * Send error alert (for critical errors)
 */
export async function sendErrorAlert(errorLog: ErrorLog): Promise<void> {
  if (errorLog.severity === 'critical') {
    // In production, send email/SMS/Slack notification
    console.error('🚨 CRITICAL ERROR:', errorLog.message);
    
    // Example: Send to admin email
    // await sendEmail({
    //   to: 'admin@ourauto.in',
    //   subject: `Critical Error: ${errorLog.error_type}`,
    //   body: `${errorLog.message}\n\n${errorLog.stack_trace}`,
    // });
  }
}

/**
 * Wrapper for try-catch with automatic logging
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    userId?: string;
    context?: Record<string, any>;
    onError?: (error: ErrorLog) => Promise<void>;
  } = {}
): Promise<{ data?: T; error?: ErrorLog }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const errorLog = await logError(error as Error | string, {
      userId: options.userId,
      category: 'unknown',
      context: options.context,
    });

    if (options.onError) {
      await options.onError(errorLog);
    }

    await sendErrorAlert(errorLog);

    return { error: errorLog };
  }
}
