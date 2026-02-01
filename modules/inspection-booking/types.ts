/**
 * Inspection Booking Module
 *
 * Schedule and manage vehicle inspections
 * - Booking calendar
 * - Inspector assignment
 * - Inspection reports
 * - Document management
 */

export interface InspectionBooking {
  id: string;
  listingId: string;
  buyerId: string;
  inspectorId?: string;
  dealerId: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  reportUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionReport {
  id: string;
  bookingId: string;
  inspectorId: string;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  mechanicalIssues: string[];
  cosmicIssues: string[];
  safetyIssues: string[];
  recommendations: string[];
  photos: string[];
  createdAt: string;
}

export interface Inspector {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  certification: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  averageRating: number;
  totalInspections: number;
}
