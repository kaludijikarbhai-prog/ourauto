/**
 * Admin Panel Module
 *
 * System administration and moderation
 * - User management
 * - Dealer verification
 * - Listing moderation
 * - System statistics
 * - Reports and compliance
 */

export interface AdminUser {
  id: string;
  userId: string;
  role: 'super_admin' | 'moderator' | 'support';
  permissions: string[];
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  targetId: string; // User or Listing ID
  targetType: 'user' | 'listing' | 'message';
  action: 'warning' | 'suspension' | 'removal' | 'appeal_review';
  reason: string;
  adminId: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalDealers: number;
  totalListings: number;
  activeListings: number;
  totalTransactions: number;
  platformRevenue: number;
  averageListingPrice: number;
}

export interface DealerVerificationRequest {
  id: string;
  dealerId: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}
