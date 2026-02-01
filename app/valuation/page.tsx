'use client';

import { useEffect, useState } from 'react';
import { calculateValuation as calculateValuationResult, saveValuation, getUserValuations } from '@/lib/valuation';
import { formatPrice } from '@/lib/utils';

export default function ValuationPage() {
  const [formData, setFormData] = useState({
    brand: 'Maruti',
    model: '',
    year: 2020,
    km: 50000,
    owners: 1,
    city: 'Mumbai',
  });

  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getUserValuations();
    setHistory(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const valuation = calculateValuationResult({
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      km: formData.km,
      owners: formData.owners,
      city: formData.city,
    });
    
    setResult(valuation);
    
    // Save valuation with input and result
    const valuationInput = {
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      km: formData.km,
      owners: formData.owners,
      city: formData.city,
    };
    await saveValuation(valuationInput, valuation);
    await loadHistory();
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Car Valuation Calculator</h1>
          <p className="text-gray-600">Get instant market value for your car</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Brand
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Maruti</option>
                    <option>Hyundai</option>
                    <option>Tata</option>
                    <option>Mahindra</option>
                    <option>Honda</option>
                    <option>Toyota</option>
                    <option>Volkswagen</option>
                    <option>Ford</option>
                  </select>
                </div>

                {/* Model */}
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

                {/* Year */}
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

                {/* KM */}
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

                {/* Owners */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Previous Owners
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
                    <option>Chennai</option>
                    <option>Hyderabad</option>
                    <option>Pune</option>
                    <option>Kolkata</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Calculating...' : 'Get Valuation'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Valuation Result</h2>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Low */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated Low</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPrice(result.estimated_price * 0.9)}
                    </p>
                  </div>

                  {/* Average */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Fair Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(result.estimated_price)}
                    </p>
                  </div>

                  {/* High */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated High</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(result.estimated_price * 1.1)}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm">
                  Valuation is based on brand, model, year, kilometers, owner history, and current market trends.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - History */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Valuations</h3>

              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No valuations yet. Get your first valuation!</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 5).map((val) => (
                    <div key={val.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(val.estimated_price)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(val.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
