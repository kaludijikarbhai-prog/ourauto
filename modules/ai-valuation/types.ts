/**
 * AI Valuation Module
 *
 * AI-powered vehicle valuation and pricing
 * - Market price estimation
 * - Condition-based adjustments
 * - Historical pricing trends
 * - Similar vehicle comparison
 */

export interface ValuationRequest {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  bodyType: string;
  fuelType: string;
}

export interface ValuationResult {
  id: string;
  listingId?: string;
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketTrend: 'increasing' | 'stable' | 'decreasing';
  comparableListings: string[]; // IDs of similar listings
  factors: ValuationFactor[];
  confidence: number; // 0-100
  createdAt: string;
}

export interface ValuationFactor {
  name: string;
  impact: 'positive' | 'neutral' | 'negative';
  percentage: number;
  description: string;
}
