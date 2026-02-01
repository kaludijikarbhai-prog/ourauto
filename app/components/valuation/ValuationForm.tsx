'use client';

import { useState } from 'react';
import {
  calculateValuation,
  saveValuation,
  BRANDS,
  getModelsForBrand,
  POPULAR_CITIES,
  ValuationInput,
  ValuationResult,
} from '@/lib/valuation';

export default function ValuationForm() {
  const [formData, setFormData] = useState<ValuationInput>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    km: 0,
    owners: 1,
    city: '',
  });

  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const availableModels = formData.brand
    ? getModelsForBrand(formData.brand)
    : [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'km' || name === 'year' || name === 'owners'
          ? parseInt(value, 10)
          : value,
    }));

    // Clear previous valuation when input changes
    if (valuation) {
      setValuation(null);
    }
    setError('');
    setSuccessMessage('');
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.brand || !formData.model || !formData.city) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.year < 1990 || formData.year > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return;
    }

    if (formData.km < 0 || formData.km > 5000000) {
      setError('Please enter a valid KM value (0 - 5,000,000)');
      return;
    }

    if (formData.owners < 1 || formData.owners > 10) {
      setError('Please enter a valid owner count (1 - 10)');
      return;
    }

    try {
      setLoading(true);
      const result = calculateValuation(formData);
      setValuation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to calculate valuation'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveValuation = async () => {
    if (!valuation) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const result = await saveValuation(formData, valuation);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage('Valuation saved successfully!');
        // Clear form after successful save
        setTimeout(() => {
          setFormData({
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            km: 0,
            owners: 1,
            city: '',
          });
          setValuation(null);
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save valuation'
      );
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Car Valuation Calculator
        </h2>

        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Brand */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <select
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a brand</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <select
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              disabled={!formData.brand}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="">
                {formData.brand ? 'Select a model' : 'Select a brand first'}
              </option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <input
              id="year"
              type="number"
              name="year"
              min="1990"
              max={new Date().getFullYear()}
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* KM Driven */}
          <div>
            <label htmlFor="km" className="block text-sm font-medium text-gray-700 mb-2">
              KM Driven
            </label>
            <input
              id="km"
              type="number"
              name="km"
              min="0"
              max="5000000"
              value={formData.km}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.km.toLocaleString('en-IN')} KM
            </p>
          </div>

          {/* Owner Count */}
          <div>
            <label htmlFor="owners" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Owners
            </label>
            <input
              id="owners"
              type="number"
              name="owners"
              min="1"
              max="10"
              value={formData.owners}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a city</option>
              {POPULAR_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {loading ? 'Calculating...' : 'Calculate Valuation'}
          </button>
        </form>
      </div>

      {/* Valuation Result */}
      {valuation && (
        <div className="space-y-4">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md p-8 border border-blue-100">
            <p className="text-gray-600 text-sm mb-2">Estimated Market Price</p>
            <h3 className="text-4xl font-bold text-blue-600 mb-4">
              {formatPrice(valuation.estimatedPrice)}
            </h3>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-600 text-xs uppercase font-semibold mb-1">
                  Minimum Price
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(valuation.priceRange.min)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-600 text-xs uppercase font-semibold mb-1">
                  Maximum Price
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(valuation.priceRange.max)}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Valuation Breakdown
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(valuation.breakdown.basePrice)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Year Depreciation</span>
                  <span>
                    -{formatPrice(valuation.breakdown.depreciation)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>KM Penalty</span>
                  <span>-{formatPrice(valuation.breakdown.kmPenalty)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Owner Penalty</span>
                  <span>
                    -{formatPrice(valuation.breakdown.ownerPenalty)}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveValuation}
              disabled={saving}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {saving ? 'Saving...' : 'Save This Valuation'}
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      {!valuation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 text-sm">
            <strong>How it works:</strong> Our AI-powered valuation calculator
            uses real market data to estimate your car's value based on brand,
            model, age, mileage, ownership history, and location. The estimated
            price range helps you understand the fair market value of your
            vehicle.
          </p>
        </div>
      )}
    </div>
  );
}
