'use client';

import { useState } from 'react';
import { calculateValuation } from '@/lib/valuation';
import { formatPrice } from '@/lib/utils';

interface QuickValuationProps {
  onClose?: () => void;
}

export default function QuickValuation({ onClose: _ }: QuickValuationProps) {
  const [formData, setFormData] = useState({
    brand: 'Maruti Suzuki',
    model: 'Swift',
    year: new Date().getFullYear() - 3,
    km: 50000,
    owners: 1,
    city: 'Ahmedabad',
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const valuation = calculateValuation({
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        km: formData.km,
        owners: formData.owners,
        city: formData.city,
      });

      setResult(valuation);
    } catch (error) {
      console.error('Error calculating valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <h2 className="text-2xl font-bold text-white">💎 Get Instant Car Valuation</h2>
        <p className="text-blue-100 mt-1">Know your car's market value in seconds</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Brand
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Maruti Suzuki</option>
                <option>Hyundai</option>
                <option>Tata</option>
                <option>Honda</option>
                <option>Mahindra</option>
                <option>Toyota</option>
                <option>Kia</option>
                <option>Nissan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Model
              </label>
              <input
                type="text"
                placeholder="Swift, Creta, Nexon..."
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Year, KM, Owners */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Year
              </label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Kilometers
              </label>
              <input
                type="number"
                min="0"
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Owners
              </label>
              <select
                value={formData.owners}
                onChange={(e) => setFormData({ ...formData, owners: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="1">1st Owner</option>
                <option value="2">2nd Owner</option>
                <option value="3">3rd Owner</option>
                <option value="4">4+ Owners</option>
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              City
            </label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Get Valuation →'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
            {/* Estimated Price */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <p className="text-gray-600 text-sm mb-2">Estimated Market Value</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatPrice(result.estimatedPrice)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Range: {formatPrice(result.priceRange.min)} – {formatPrice(result.priceRange.max)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Price Breakdown</h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(result.breakdown.basePrice)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year Depreciation</span>
                  <span className="text-red-600 font-semibold">
                    -{formatPrice(result.breakdown.depreciation)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mileage Penalty</span>
                  <span className="text-red-600 font-semibold">
                    -{formatPrice(result.breakdown.kmPenalty)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Owner Penalty</span>
                  <span className="text-red-600 font-semibold">
                    -{formatPrice(result.breakdown.ownerPenalty)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
                  <span className="text-gray-900">Estimated Price</span>
                  <span className="text-blue-600">{formatPrice(result.estimatedPrice)}</span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-xs text-blue-900">
                💡 This is an estimated valuation based on market data. Actual price may vary
                depending on car condition, features, service history, and demand.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
