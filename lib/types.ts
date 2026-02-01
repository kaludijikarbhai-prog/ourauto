/**
 * Shared TypeScript types and interfaces for OurAuto
 */

// ============ PROFILES ============
export type UserRole = 'user' | 'dealer' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

// ============ CARS ============
export type CarStatus = 'draft' | 'live' | 'sold';

export interface Car {
  id: string;
  owner_id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  city: string;
  description?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  owners?: number | null;
  status: CarStatus;
  created_at: string;
}

export interface CarWithImages extends Car {
  images: CarImage[];
}

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  created_at: string;
}

// ============ LISTINGS ============
export interface UserListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  images: CarImage[];
  status: CarStatus;
  created_at: string;
}

// ============ WISHLIST ============
export interface Wishlist {
  id: string;
  user_id: string;
  car_id: string;
  created_at: string;
}

export interface WishlistWithCar extends Wishlist {
  car: Car;
}

// ============ CHAT REQUESTS ============
export type ChatRequestStatus = 'pending' | 'accepted' | 'rejected' | 'closed';

export interface ChatRequest {
  id: string;
  car_id: string;
  buyer_id: string;
  seller_id: string;
  status: ChatRequestStatus;
  masked_buyer_phone: string | null;
  masked_seller_phone: string | null;
  created_at: string;
}

export interface ChatRequestWithCar extends ChatRequest {
  car: Car;
  buyer: Profile;
  seller: Profile;
}

// ============ VALUATION ============
export interface Valuation {
  id: string;
  user_id: string;
  image_url: string;
  estimated_price: number;
  created_at: string;
}

// ============ INSPECTIONS ============
export type InspectionStatus = 'pending' | 'confirmed' | 'completed';

export interface Inspection {
  id: string;
  user_id: string;
  car_id: string;
  city: string;
  date: string;
  time_slot: string;
  status: InspectionStatus;
  created_at: string;
}

export interface InspectionWithCar extends Inspection {
  car: Car;
}

// ============ DEALER LEADS ============
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'closed';

export interface DealerLead {
  id: string;
  dealer_id: string;
  car_id: string;
  inspection_id: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface DealerLeadWithDetails extends DealerLead {
  car: Car;
  inspection?: Inspection;
}

// ============ ADMIN ============
export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportEntityType = 'car' | 'user' | 'message';

export interface Report {
  id: string;
  reported_by: string;
  entity_type: ReportEntityType;
  entity_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
}

// ============ SEARCH & FILTER ============
export interface CarSearchParams {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxKm?: number;
  city?: string;
  fuel?: string;
  transmission?: string;
  sort?: 'newest' | 'price_low' | 'price_high' | 'km_low';
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============ PHASE 2: LEAD LOCKS ============
export type LeadLockStatus = 'locked' | 'available' | 'sold' | 'expired';

export interface LeadLock {
  id: string;
  car_id: string;
  dealer_id: string;
  status: LeadLockStatus;
  reason?: string;
  locked_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface LeadLockWithDealer extends LeadLock {
  dealer_name?: string;
  dealer_phone?: string;
  dealer_city?: string;
}

// ============ PHASE 2: WATERMARK ============
export interface WatermarkedImage {
  id: string;
  car_image_id: string;
  original_url: string;
  watermarked_url: string;
  watermark_text: string;
  watermark_position: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  created_at: string;
}

export interface CarImageWithWatermark extends CarImage {
  is_watermarked: boolean;
  watermark_applied_at?: string;
  watermark_info?: WatermarkedImage;
}

// ============ PHASE 2: VIRTUAL NUMBERS ============
export interface VirtualNumber {
  id: string;
  chat_request_id: string;
  buyer_virtual_number: string;
  seller_virtual_number: string;
  buyer_real_phone: string;
  seller_real_phone: string;
  call_logs_buyer: number;
  call_logs_seller: number;
  status: 'active' | 'ended';
  created_at: string;
  expires_at: string;
  ended_at?: string;
}

// ============ PHASE 2: CONTACT MASK ============
export interface ContactMask {
  id: string;
  car_id: string;
  dealer_phone: string;
  masked_phone: string;
  view_count: number;
  click_count: number;
  created_at: string;
}

// ============ PHASE 2: LEAD ACTIVITY LOG ============
export type LeadActivityAction = 'view' | 'contact_show' | 'call' | 'message' | 'inspection_booked';

export interface LeadActivityLog {
  id: string;
  lead_lock_id?: string;
  dealer_id: string;
  car_id: string;
  action: LeadActivityAction;
  details?: Record<string, any>;
  created_at: string;
}

// ============ API RESPONSES ============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
