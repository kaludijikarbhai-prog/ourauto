import { supabase } from './supabase';
import { getUser } from './auth';

export interface ValuationInput {
  brand: string;
  model: string;
  year: number;
  km: number;
  owners: number;
  city: string;
}

export interface ValuationResult {
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  breakdown: {
    basePrice: number;
    depreciation: number;
    kmPenalty: number;
    ownerPenalty: number;
  };
}

// Base prices for Indian car market (in INR)
const BASE_PRICES: Record<string, Record<string, number>> = {
  'Maruti Suzuki': {
    'Swift': 550000,
    'Baleno': 650000,
    'Celerio': 450000,
    'Wagon R': 500000,
    'Dzire': 550000,
    'Vitara Brezza': 800000,
    'Ertiga': 900000,
    'XL5': 750000,
  },
  'Hyundai': {
    'i10': 500000,
    'i20': 650000,
    'Venue': 750000,
    'Creta': 1000000,
    'Tucson': 1500000,
    'Kona': 1200000,
    'Verna': 750000,
    'Elantra': 950000,
  },
  'Tata': {
    'Nexon': 850000,
    'Nexon EV': 1500000,
    'Tiago': 450000,
    'Tigor': 550000,
    'Harrier': 1300000,
    'Safari': 1600000,
    'Hexa': 1400000,
    'Altroz': 600000,
  },
  'Honda': {
    'City': 750000,
    'Civic': 1100000,
    'CR-V': 1500000,
    'Jazz': 650000,
    'Amaze': 600000,
    'WR-V': 800000,
  },
  'Mahindra': {
    'XUV300': 800000,
    'XUV400': 900000,
    'Scorpio': 1200000,
    'Bolero': 700000,
    'Quanto': 550000,
    'TUV300': 750000,
  },
  'Kia': {
    'Seltos': 950000,
    'Sonet': 700000,
    'Carens': 1000000,
    'Sportage': 1500000,
  },
  'Toyota': {
    'Fortuner': 2000000,
    'Innova': 1400000,
    'Innova Crysta': 1600000,
    'Glanza': 650000,
    'Yaris': 800000,
    'Rumion': 950000,
  },
  'Nissan': {
    'Magnite': 500000,
    'Kicks': 650000,
    'Terrano': 950000,
    'Altima': 1400000,
  },
  'Force': {
    'Gurkha': 1200000,
  },
  'Renault': {
    'Kwid': 350000,
    'Triber': 500000,
    'Kiger': 600000,
  },
};

/**
 * Get base price for a car brand and model
 */
export function getBasePrice(brand: string, model: string): number {
  const brandPrices = BASE_PRICES[brand];
  if (!brandPrices) {
    return 500000; // Default base price
  }

  const modelPrice = brandPrices[model];
  if (!modelPrice) {
    // Return average of brand prices if model not found
    const prices = Object.values(brandPrices);
    return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  }

  return modelPrice;
}

/**
 * Calculate depreciation based on year
 * Cars depreciate ~15% per year in Indian market
 */
export function calculateDepreciation(
  basePrice: number,
  year: number
): number {
  const currentYear = new Date().getFullYear();
  const ageInYears = currentYear - year;

  if (ageInYears < 0) return 0;
  if (ageInYears > 20) return basePrice * 0.95; // Min 5% of base price

  // 15% depreciation per year
  const depreciationRate = 0.15;
  const depreciationFactor = Math.pow(1 - depreciationRate, ageInYears);
  const currentPrice = basePrice * depreciationFactor;

  return Math.max(basePrice * 0.05, basePrice - currentPrice);
}

/**
 * Calculate KM penalty
 * Every 10,000 KM reduces value
 */
export function calculateKmPenalty(
  basePrice: number,
  km: number
): number {
  // 0.1% value reduction per 1000 KM (0.01% per 100 KM)
  const penaltyRate = (km / 100000) * basePrice;
  const maxPenalty = basePrice * 0.5; // Max 50% penalty for high KM

  return Math.min(penaltyRate, maxPenalty);
}

/**
 * Calculate owner penalty
 * Additional owners reduce value
 */
export function calculateOwnerPenalty(
  basePrice: number,
  owners: number
): number {
  if (owners <= 1) return 0;

  // 5% penalty per additional owner
  const penaltyRate = (owners - 1) * 0.05;
  const penalty = basePrice * penaltyRate;

  return Math.min(penalty, basePrice * 0.2); // Max 20% penalty
}

/**
 * Apply city-based adjustment
 * Metropolitan cities have better resale value
 */
export function getCityMultiplier(city: string): number {
  const metropolitanCities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Pune',
    'Chennai',
  ];

  if (metropolitanCities.includes(city)) {
    return 1.05; // 5% premium
  }

  return 1.0; // No change for other cities
}

/**
 * Calculate complete valuation for a car
 */
export function calculateValuation(input: ValuationInput): ValuationResult {
  const basePrice = getBasePrice(input.brand, input.model);
  const depreciation = calculateDepreciation(basePrice, input.year);
  const kmPenalty = calculateKmPenalty(basePrice, input.km);
  const ownerPenalty = calculateOwnerPenalty(basePrice, input.owners);

  // Calculate estimated price
  let estimatedPrice =
    basePrice - depreciation - kmPenalty - ownerPenalty;

  // Apply city multiplier
  const cityMultiplier = getCityMultiplier(input.city);
  estimatedPrice = Math.round(estimatedPrice * cityMultiplier);

  // Ensure minimum price (10% of base)
  const minPrice = Math.round(basePrice * 0.1);
  estimatedPrice = Math.max(estimatedPrice, minPrice);

  // Calculate price range (±10%)
  const priceRange = {
    min: Math.round(estimatedPrice * 0.9),
    max: Math.round(estimatedPrice * 1.1),
  };

  return {
    estimatedPrice,
    priceRange,
    breakdown: {
      basePrice,
      depreciation: Math.round(depreciation),
      kmPenalty: Math.round(kmPenalty),
      ownerPenalty: Math.round(ownerPenalty),
    },
  };
}

/**
 * Save valuation to Supabase
 */
export async function saveValuation(
  input: ValuationInput,
  valuation: ValuationResult
): Promise<{ id: string; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('valuations')
      .insert([
        {
          user_id: user.id,
          brand: input.brand,
          model: input.model,
          year: input.year,
          km: input.km,
          owners: input.owners,
          city: input.city,
          price: valuation.estimatedPrice,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return { id: data.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save valuation';
    console.error('Save valuation error:', message);
    return { id: '', error: message };
  }
}

/**
 * Get user's valuation history
 */
export async function getUserValuations(): Promise<
  Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    created_at: string;
  }>
> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('valuations')
      .select('id, brand, model, year, price, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Get valuations error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get valuations error:', error);
    return [];
  }
}

/**
 * Available brands
 */
export const BRANDS = Object.keys(BASE_PRICES).sort();

/**
 * Get available models for a brand
 */
export function getModelsForBrand(brand: string): string[] {
  const models = BASE_PRICES[brand];
  if (!models) {
    return [];
  }
  return Object.keys(models).sort();
}

/**
 * Popular cities in India
 */
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
  'Nagpur',
  'Kochi',
  'Visakhapatnam',
  'Gurgaon',
  'Noida',
  'Ghaziabad',
  'Greater Noida',
  'Faridabad',
  'Bhopal',
  'Patna',
];
