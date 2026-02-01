/**
 * Car Listing Module
 *
 * Vehicle listing system for buyers and sellers
 * - Create/edit/delete listings
 * - Search and filter
 * - Image management
 * - Pricing history
 */

export interface CarListing {
  id: string;
  dealerId: string;
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  color: string;
  transmission: 'manual' | 'automatic' | 'cvt';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  bodyType: 'sedan' | 'suv' | 'truck' | 'van' | 'coupe' | 'hatchback';
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  images: string[];
  features: string[];
  status: 'active' | 'sold' | 'pending' | 'draft';
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface ListingFilter {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: string;
  bodyType?: string;
  status?: string;
}
