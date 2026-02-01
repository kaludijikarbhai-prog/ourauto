/**
 * User side services (selling cars, wishlists, etc.)
 */

import { supabase } from './supabase';
import { getUser } from './auth';
import {
  Car,
  CarImage,
  UserListing,
  CarWithImages,
  CarSearchParams,
  PaginatedResponse,
  ApiResponse,
} from './types';
import { getPaginationParams } from './utils';

/**
 * Create a car listing (draft)
 */
export async function createCarListing(input: {
  title: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  city: string;
  description?: string;
  transmission?: string;
  fuel?: string;
  owners?: number;
}): Promise<ApiResponse<Car>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('cars')
      .insert([
        {
          owner_id: user.id,
          title: input.title,
          brand: input.brand,
          model: input.model,
          year: input.year,
          km: input.km,
          price: input.price,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Create car error:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Create car error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create listing' };
  }
}

/**
 * Upload car images
 */
export async function uploadCarImages(
  carId: string,
  files: File[]
): Promise<ApiResponse<CarImage[]>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify car ownership
    const { data: car } = await supabase.from('cars').select('owner_id').eq('id', carId).single();
    if (car?.owner_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const uploadedImages: CarImage[] = [];

    for (const file of files) {
      const fileName = `${carId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('car-photos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Get public URL
      const { data } = supabase.storage.from('car-photos').getPublicUrl(fileName);
      const publicUrl = data?.publicUrl;

      // Save to database
      const { data: imageData } = await supabase
        .from('car_images')
        .insert([{ car_id: carId, image_url: publicUrl }])
        .select()
        .single();

      if (imageData) {
        uploadedImages.push(imageData);
      }
    }

    return { data: uploadedImages };
  } catch (error) {
    console.error('Upload images error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to upload images' };
  }
}

/**
 * Delete car image
 */
export async function deleteCarImage(imageId: string): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get image and verify ownership
    const { data: image } = await supabase.from('car_images').select('*, cars(owner_id)').eq('id', imageId).single();
    if (image?.cars?.owner_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    // Delete from storage
    if (image.image_url) {
      const filePath = image.image_url.split('/').pop() || '';
      await supabase.storage.from('car-photos').remove([`${image.cars?.id}/${filePath}`]);
    }

    // Delete from database
    const { error } = await supabase.from('car_images').delete().eq('id', imageId);
    if (error) {
      return { error: error.message };
    }

    return { data: null };
  } catch (error) {
    console.error('Delete image error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete image' };
  }
}

/**
 * Update car listing
 */
export async function updateCarListing(carId: string, updates: Partial<Car>): Promise<ApiResponse<Car>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify ownership
    const { data: car } = await supabase.from('cars').select('owner_id').eq('id', carId).single();
    if (car?.owner_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase.from('cars').update(updates).eq('id', carId).select().single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Update car error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update listing' };
  }
}

/**
 * Publish car listing (draft → live)
 */
export async function publishCarListing(carId: string): Promise<ApiResponse<Car>> {
  return updateCarListing(carId, { status: 'live' });
}

/**
 * Unpublish car listing (live → draft)
 */
export async function unpublishCarListing(carId: string): Promise<ApiResponse<Car>> {
  return updateCarListing(carId, { status: 'draft' });
}

/**
 * Delete car listing
 */
export async function deleteCarListing(carId: string): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify ownership
    const { data: car } = await supabase.from('cars').select('owner_id').eq('id', carId).single();
    if (car?.owner_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    // Delete car (cascade will delete images)
    const { error } = await supabase.from('cars').delete().eq('id', carId);
    if (error) {
      return { error: error.message };
    }

    return { data: null };
  } catch (error) {
    console.error('Delete car error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete listing' };
  }
}

/**
 * Get user's listings
 */
export async function getUserListings(): Promise<UserListing[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('cars')
      .select(
        `
        id,
        title,
        brand,
        model,
        price,
        status,
        created_at
      `
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get listings error:', error);
      return [];
    }

    // Get images for each car
    const carIds = data?.map((c: any) => c.id) || [];
    if (carIds.length === 0) {
      return [];
    }

    const { data: images } = await supabase
      .from('car_images')
      .select('id, car_id, image_url, created_at')
      .in('car_id', carIds);

    const imageMap = new Map();
    images?.forEach((img: any) => {
      if (!imageMap.has(img.car_id)) {
        imageMap.set(img.car_id, []);
      }
      imageMap.get(img.car_id).push(img);
    });

    return (data || []).map((car: any) => ({
      ...car,
      images: imageMap.get(car.id) || [],
    }));
  } catch (error) {
    console.error('Get listings error:', error);
    return [];
  }
}

/**
 * Get car with images
 */
export async function getCarWithImages(carId: string): Promise<CarWithImages | null> {
  try {
    const { data: car } = await supabase.from('cars').select('*').eq('id', carId).single();

    if (!car) {
      return null;
    }

    const { data: images } = await supabase
      .from('car_images')
      .select('id, car_id, image_url, created_at')
      .eq('car_id', carId);

    return {
      ...car,
      images: images || [],
    };
  } catch (error) {
    console.error('Get car error:', error);
    return null;
  }
}

/**
 * Search and filter cars
 */
export async function searchCars(
  params: CarSearchParams
): Promise<PaginatedResponse<CarWithImages>> {
  try {
    const { offset, limit, page } = getPaginationParams(params.page);

    let query = supabase.from('cars').select('*', { count: 'exact' }).eq('status', 'live');

    if (params.brand) {
      query = query.eq('brand', params.brand);
    }
    if (params.model) {
      query = query.eq('model', params.model);
    }
    if (params.minPrice) {
      query = query.gte('price', params.minPrice);
    }
    if (params.maxPrice) {
      query = query.lte('price', params.maxPrice);
    }
    if (params.minYear) {
      query = query.gte('year', params.minYear);
    }
    if (params.maxYear) {
      query = query.lte('year', params.maxYear);
    }
    if (params.maxKm) {
      query = query.lte('km', params.maxKm);
    }
    if (params.city) {
      query = query.eq('city', params.city);
    }

    // Apply sorting
    const sortMap: { [key: string]: any } = {
      newest: { column: 'created_at', ascending: false },
      price_low: { column: 'price', ascending: true },
      price_high: { column: 'price', ascending: false },
      km_low: { column: 'km', ascending: true },
    };

    const sort = sortMap[params.sort || 'newest'];
    query = query.order(sort.column, { ascending: sort.ascending });

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Search error:', error);
      return { data: [], total: 0, page, limit, hasMore: false };
    }

    // Get images for each car
    const carIds = data?.map((c: any) => c.id) || [];
    const { data: images } = await supabase
      .from('car_images')
      .select('id, car_id, image_url, created_at')
      .in('car_id', carIds);

    const imageMap = new Map();
    images?.forEach((img: any) => {
      if (!imageMap.has(img.car_id)) {
        imageMap.set(img.car_id, []);
      }
      imageMap.get(img.car_id).push(img);
    });

    const cars = (data || []).map((car: any) => ({
      ...car,
      images: imageMap.get(car.id) || [],
    }));

    return {
      data: cars,
      total: count || 0,
      page,
      limit,
      hasMore: offset + limit < (count || 0),
    };
  } catch (error) {
    console.error('Search error:', error);
    return { data: [], total: 0, page: 1, limit: 12, hasMore: false };
  }
}

/**
 * Get trending cars (most viewed, recent)
 */
export async function getTrendingCars(limit: number = 8): Promise<CarWithImages[]> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    // Get images
    const carIds = data.map((c: any) => c.id);
    const { data: images } = await supabase
      .from('car_images')
      .select('id, car_id, image_url, created_at')
      .in('car_id', carIds);

    const imageMap = new Map();
    images?.forEach((img: any) => {
      if (!imageMap.has(img.car_id)) {
        imageMap.set(img.car_id, []);
      }
      imageMap.get(img.car_id).push(img);
    });

    return data.map((car: any) => ({
      ...car,
      images: imageMap.get(car.id) || [],
    }));
  } catch (error) {
    console.error('Get trending error:', error);
    return [];
  }
}
