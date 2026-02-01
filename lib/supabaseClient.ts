// --- FILTERED CARS, FILTER OPTIONS ---
type FilterParams = {
  page?: number;
  search?: string;
  brand?: string;
  city?: string;
  fuel?: string;
  min?: number;
  max?: number;
  yearMin?: number;
  yearMax?: number;
  sort?: string;
};

export async function getFilteredCars(params: FilterParams) {
  const perPage = 12;
  let query = supabase.from('cars').select('*', { count: 'exact' });
  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
      .or(`brand.ilike.%${params.search}%,model.ilike.%${params.search}%`);
  }
  if (params.brand) query = query.eq('brand', params.brand);
  if (params.city) query = query.eq('city', params.city);
  if (params.fuel) query = query.eq('fuel', params.fuel);
  if (params.min) query = query.gte('price', params.min);
  if (params.max) query = query.lte('price', params.max);
  if (params.yearMin) query = query.gte('year', params.yearMin);
  if (params.yearMax) query = query.lte('year', params.yearMax);
  // Sorting
  switch (params.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'km_asc': query = query.order('km', { ascending: true }); break;
    default: query = query.order('created_at', { ascending: false });
  }
  // Pagination
  const from = ((params.page || 1) - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);
  const { data, count } = await query;
  return { cars: data || [], total: count || 0 };
}

export async function getFilterOptions() {
  // Get unique brands, cities, fuels, min/max year, min/max price
  const [{ data: brands }, { data: cities }, { data: fuels }, { data: yearMin }, { data: yearMax }, { data: priceMin }, { data: priceMax }] = await Promise.all([
    supabase.from('cars').select('brand').neq('brand', '').order('brand', { ascending: true }).then(r => ({ data: [...new Set((r.data||[]).map((c:any)=>c.brand))].map((b:string)=>({ value: b, label: b })) })),
    supabase.from('cars').select('city').neq('city', '').order('city', { ascending: true }).then(r => ({ data: [...new Set((r.data||[]).map((c:any)=>c.city))].map((b:string)=>({ value: b, label: b })) })),
    supabase.from('cars').select('fuel').neq('fuel', '').order('fuel', { ascending: true }).then(r => ({ data: [...new Set((r.data||[]).map((c:any)=>c.fuel))].map((b:string)=>({ value: b, label: b })) })),
    supabase.from('cars').select('year').order('year', { ascending: true }).limit(1),
    supabase.from('cars').select('year').order('year', { ascending: false }).limit(1),
    supabase.from('cars').select('price').order('price', { ascending: true }).limit(1),
    supabase.from('cars').select('price').order('price', { ascending: false }).limit(1),
  ]);
  return {
    brands: brands?.data || [],
    cities: cities?.data || [],
    fuels: fuels?.data || [],
    yearMin: yearMin?.data?.[0]?.year || 2000,
    yearMax: yearMax?.data?.[0]?.year || new Date().getFullYear(),
    priceMin: priceMin?.data?.[0]?.price || 0,
    priceMax: priceMax?.data?.[0]?.price || 10000000,
  };
}
// DEPRECATED: Use lib/supabase.ts for all supabase client usage.
// This file is now unused and will be deleted in cleanup.

export async function getAllCars() {
  const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getCarById(id: string) {
  const { data } = await supabase.from('cars').select('*, profiles(email)').eq('id', id).single();
  if (!data) return null;
  return {
    ...data,
    user_email: data.profiles?.email || null,
  };
}

export async function getUserCars(userId: string) {
  const { data } = await supabase.from('cars').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function insertCar(car: any) {
  const { data, error } = await supabase.from('cars').insert([car]);
  if (error) throw error;
  return data;
}

export async function deleteCar(id: string, userId: string) {
  const { error } = await supabase.from('cars').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const filePath = `cars/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('cars').upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('cars').getPublicUrl(filePath);
    urls.push(publicUrl);
  }
  return urls;
}
