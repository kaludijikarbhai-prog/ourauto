'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateValuation } from '@/lib/valuation';
import { formatPrice } from '@/lib/utils';

// Lazy load supabase to avoid server-side import
let supabase: any = null;

const initSupabase = async () => {
  if (!supabase) {
    const { supabase: sb } = await import('@/lib/supabase');
    supabase = sb;
  }
  return supabase;
};

interface ValuationBreakdown {
  estimatedPrice: number;
  breakdown: {
    basePrice: number;
    depreciation: number;
    kmPenalty: number;
    ownerPenalty: number;
  };
}

export default function AddCarForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [valuation, setValuation] = useState<ValuationBreakdown | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [form, setForm] = useState({
    brand: 'Maruti Suzuki',
    model: '',
    year: new Date().getFullYear() - 3,
    km: 50000,
    owners: '1',
    city: 'Mumbai',
    basePrice: '',
    price: '',
    title: '',
    description: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    condition: 'Good',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'km' || name === 'basePrice' || name === 'price'
        ? value
        : value,
    }));
  };

  const handleAutoSuggestPrice = async () => {
    if (!form.brand || !form.model || !form.basePrice) {
      alert('Please fill Brand, Model, and Base Price first');
      return;
    }

    try {
      setLoading(true);

      const result = calculateValuation({
        brand: form.brand,
        model: form.model,
        year: parseInt(form.year as any),
        km: parseInt(form.km as any),
        owners: parseInt(form.owners),
        city: form.city,
      });

      setValuation(result);
      setForm((prev) => ({
        ...prev,
        price: result.estimatedPrice.toString(),
      }));
      setShowBreakdown(true);
    } catch (error) {
      console.error('Error calculating valuation:', error);
      alert('Error calculating price. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.brand || !form.model || !form.price) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Initialize supabase client
      const sb = await initSupabase();

      // ✅ Get logged user safely from Supabase auth
      const {
        data: { user },
        error: authError,
      } = await sb.auth.getUser();

      if (authError || !user) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      // ✅ Insert car listing with safe user.id
      const { error } = await sb.from('cars').insert([
        {
          user_id: user.id,
          brand: form.brand,
          model: form.model,
          title: form.title || `${form.year} ${form.brand} ${form.model}`,
          year: parseInt(form.year as any),
          km: parseInt(form.km as any),
          price: parseInt(form.price),
          city: form.city,
          owners: parseInt(form.owners),
          fuel_type: form.fuelType,
          transmission: form.transmission,
          description: form.description,
          status: 'draft',
          condition: form.condition,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Success
      alert('✅ Car listing created successfully!');
      router.push('/dealer/listings');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.message || 'Failed to create listing'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
          <p className="text-gray-600 mt-2">
            List your car with automatic valuation. Professional pricing in seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Basic Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Brand *
                </label>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option>Maruti Suzuki</option>
                  <option>Hyundai</option>
                  <option>Tata</option>
                  <option>Honda</option>
                  <option>Mahindra</option>
                  <option>Toyota</option>
                  <option>Kia</option>
                  <option>Nissan</option>
                  <option>Renault</option>
                  <option>Force</option>
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g., Swift, Creta, Nexon"
                  value={form.model}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={form.year}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>

              {/* KM Driven */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kilometers Driven *
                </label>
                <input
                  type="number"
                  name="km"
                  placeholder="e.g., 50000"
                  value={form.km}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>

              {/* Owners */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Previous Owners *
                </label>
                <select
                  name="owners"
                  value={form.owners}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4">4+ Owners</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City *
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                  <option>Pune</option>
                  <option>Chennai</option>
                  <option>Ahmedabad</option>
                  <option>Goa</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Valuation */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-8 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              💎 Auto Valuation Engine
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Base Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Market Base Price * (for calculation)
                </label>
                <input
                  type="number"
                  name="basePrice"
                  placeholder="e.g., 600000"
                  value={form.basePrice}
                  onChange={handleInputChange}
                  required
                  className="input bg-white"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Base new car price for your model
                </p>
              </div>

              {/* Suggested Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Final Listed Price *
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Auto-filled or enter custom"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  className="input bg-white font-bold text-green-600"
                />
                {form.price && (
                  <p className="text-sm font-bold text-green-600 mt-1">
                    {formatPrice(parseInt(form.price))}
                  </p>
                )}
              </div>
            </div>

            {/* Auto Suggest Button */}
            <button
              type="button"
              onClick={handleAutoSuggestPrice}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? '⏳ Calculating...' : '⚡ Auto-Suggest Price from Market Data'}
            </button>

            {/* Breakdown */}
            {valuation && showBreakdown && (
              <div className="mt-6 bg-white rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-gray-900 mb-3">Price Breakdown:</h3>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold">
                    {formatPrice(valuation.breakdown.basePrice)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year Depreciation</span>
                  <span className="text-red-600 font-semibold">
                    -{formatPrice(valuation.breakdown.depreciation)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mileage Penalty</span>
                  <span className="text-red-600 font-semibold">
                    -{formatPrice(valuation.breakdown.kmPenalty)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Owner Penalty</span>
                  <span className="text-red-600 font-semibold">
                    -{formatPrice(valuation.breakdown.ownerPenalty)}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-gray-900">Estimated Price</span>
                  <span className="text-green-600">
                    {formatPrice(valuation.estimatedPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🚗 Car Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Maruti Swift, Excellent Condition"
                  value={form.title}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>CNG</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Transmission
                </label>
                <select
                  name="transmission"
                  value={form.transmission}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option>Manual</option>
                  <option>Automatic</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Needs Repair</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="Describe your car's condition, features, service history, etc..."
                value={form.description}
                onChange={handleInputChange}
                rows={4}
                className="input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-lg text-lg transition-colors"
            >
              {submitting ? '⏳ Listing Car...' : '✅ List Car Now'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Use the Auto-Suggest feature to get instant market-based pricing.
              This helps your listing compete with similar cars and attract more buyers!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
