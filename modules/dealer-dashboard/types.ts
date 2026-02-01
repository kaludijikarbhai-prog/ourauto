/**
 * Dealer Dashboard Module
 *
 * Dashboard and management panel for car dealers
 * - Vehicle inventory management
 * - Sales statistics
 * - Customer interactions
 * - Pricing management
 */

export interface DealerProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  logo?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DealerStats {
  totalListings: number;
  activeListings: number;
  soldThisMonth: number;
  totalViews: number;
  avgListingTime: number; // days
}
