import { supabase } from './supabase';
import { getUser } from './auth';

export interface CarListingInput {
  brand: string;
  model: string;
  year: number;
  km: number;
  owners: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric';
  price: number;
  city: string;
  description: string;
  phoneNumber: string;
}

export interface CarListing {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  owners: number;
  transmission: string;
  fuelType: string;
  price: number;
  city: string;
  description: string;
  phoneNumber: string;
  status: 'active' | 'sold' | 'inactive';
  photoUrls: string[];
  rcDocUrl: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Upload image to Supabase storage
 */
export async function uploadCarPhoto(
  carId: string,
  file: File
): Promise<{ url: string; error?: string }> {
  try {
    const timestamp = Date.now();
    const filename = `${carId}/${timestamp}-${file.name}`;

    const { error } = await supabase.storage
      .from('car-photos')
      .upload(filename, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('car-photos').getPublicUrl(filename);

    return { url: publicUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload photo';
    return { url: '', error: message };
  }
}

/**
 * Upload RC document to Supabase storage
 */
export async function uploadRcDocument(
  carId: string,
  file: File
): Promise<{ url: string; error?: string }> {
  try {
    const timestamp = Date.now();
    const filename = `${carId}/rc-${timestamp}.pdf`;

    const { error } = await supabase.storage
      .from('car-rc-docs')
      .upload(filename, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('car-rc-docs').getPublicUrl(filename);

    return { url: publicUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload RC document';
    return { url: '', error: message };
  }
}

/**
 * Create new car listing
 */
export async function createCarListing(
  input: CarListingInput,
  photoUrls: string[],
  rcDocUrl?: string
): Promise<{ car: CarListing | null; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('cars')
      .insert([
        {
          user_id: user.id,
          brand: input.brand,
          model: input.model,
          year: input.year,
          km: input.km,
          owners: input.owners,
          transmission: input.transmission,
          fuelType: input.fuelType,
          price: input.price,
          city: input.city,
          description: input.description,
          phoneNumber: input.phoneNumber,
          status: 'active',
          photoUrls: photoUrls,
          rcDocUrl: rcDocUrl || null,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { car: data as CarListing };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create listing';
    return { car: null, error: message };
  }
}

/**
 * Get single car listing by ID
 */
export async function getCarListing(
  carId: string
): Promise<CarListing | null> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single();

    if (error) {
      console.error('Get car error:', error);
      return null;
    }

    return data as CarListing;
  } catch (error) {
    console.error('Get car error:', error);
    return null;
  }
}

/**
 * Get all active car listings with pagination
 */
export async function getAllCars(
  page: number = 1,
  limit: number = 12
): Promise<{ cars: CarListing[]; total: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) throw countError;

    // Get paginated data
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      cars: (data || []) as CarListing[],
      total: count || 0,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch cars';
    return { cars: [], total: 0, error: message };
  }
}

/**
 * Search cars with filters
 */
export async function searchCars(filters: {
  brand?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  page?: number;
  limit?: number;
}): Promise<{ cars: CarListing[]; total: number; error?: string }> {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('cars')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.fuelType) {
      query = query.eq('fuelType', filters.fuelType);
    }
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      cars: (data || []) as CarListing[],
      total: count || 0,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to search cars';
    return { cars: [], total: 0, error: message };
  }
}

/**
 * Get user's car listings
 */
export async function getUserCars(): Promise<CarListing[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user cars error:', error);
      return [];
    }

    return (data || []) as CarListing[];
  } catch (error) {
    console.error('Get user cars error:', error);
    return [];
  }
}

/**
 * Update car listing
 */
export async function updateCarListing(
  carId: string,
  updates: Partial<CarListingInput> & { status?: string }
): Promise<{ car: CarListing | null; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const { data: car } = await supabase
      .from('cars')
      .select('user_id')
      .eq('id', carId)
      .single();

    if (car?.user_id !== user.id) {
      throw new Error('You can only update your own listings');
    }

    const { data, error } = await supabase
      .from('cars')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', carId)
      .select()
      .single();

    if (error) throw error;

    return { car: data as CarListing };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update listing';
    return { car: null, error: message };
  }
}

/**
 * Delete car listing
 */
export async function deleteCarListing(
  carId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const { data: car } = await supabase
      .from('cars')
      .select('user_id')
      .eq('id', carId)
      .single();

    if (car?.user_id !== user.id) {
      throw new Error('You can only delete your own listings');
    }

    const { error } = await supabase.from('cars').delete().eq('id', carId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete listing';
    return { success: false, error: message };
  }
}

/**
 * Car brands and common models
 */
export const CAR_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Honda',
  'Mahindra',
  'Kia',
  'Toyota',
  'Nissan',
  'Force',
  'Renault',
  'Skoda',
  'BMW',
  'Audi',
  'Mercedes-Benz',
  'Volkswagen',
];

export const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric'];
export const TRANSMISSIONS = ['manual', 'automatic'];

export const POPULAR_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Nashik',
  'Surat',
  'Vadodara',
];

/**
 * Get car listings with dealer verification status
 */
export async function getCarListingsWithDealerStatus() {
  const { data, error } = await supabase
    .from('car_listings')
    .select(`*, dealer_profiles(verified)`) // join dealer_profiles
    .eq('dealer_profiles.status', 'approved');
  if (error) throw new Error(error.message);
  return (data || []).map((car: any) => ({
    ...car,
    dealer_verified: car.dealer_profiles?.verified || false,
  }));
}
