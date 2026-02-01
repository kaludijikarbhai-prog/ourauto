'use client';

import QuickValuation from '@/components/valuation/QuickValuation';

export default function ValuationEnginePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            💎 Auto Valuation Engine
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Get an instant, accurate market valuation for any car
          </p>
          <p className="text-gray-500">
            Trusted by thousands of buyers and sellers across India
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">Get valuation in seconds, not hours</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Accurate Pricing</h3>
            <p className="text-sm text-gray-600">Based on market data and conditions</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
            <p className="text-sm text-gray-600">See price breakdown and factors</p>
          </div>
        </div>

        {/* Valuation Form */}
        <QuickValuation />

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enter Details</h3>
              <p className="text-sm text-gray-600">
                Provide your car's brand, model, year, mileage, and location
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analysis</h3>
              <p className="text-sm text-gray-600">
                Our engine analyzes market data and car condition factors
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Result</h3>
              <p className="text-sm text-gray-600">
                Get estimated price with min-max range instantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">List & Sell</h3>
              <p className="text-sm text-gray-600">
                Use valuation to price your listing competitively
              </p>
            </div>
          </div>
        </div>

        {/* Valuation Factors */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Factors We Consider</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">
                  <strong>Brand & Model</strong> - Market demand and popularity
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">
                  <strong>Year</strong> - Depreciation based on age
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">
                  <strong>Mileage</strong> - Usage and wear impact
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">
                  <strong>Ownership History</strong> - Previous owners count
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-3">✓</span>
                <span className="text-gray-700">
                  <strong>Location</strong> - City demand and market dynamics
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why Use Our Engine?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">★</span>
                <span className="text-gray-700">
                  <strong>Market-Based</strong> - Based on real listings and sales
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">★</span>
                <span className="text-gray-700">
                  <strong>Up-to-Date</strong> - Real-time market data
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">★</span>
                <span className="text-gray-700">
                  <strong>Transparent</strong> - Detailed breakdown included
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">★</span>
                <span className="text-gray-700">
                  <strong>Instant</strong> - Results in seconds
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">★</span>
                <span className="text-gray-700">
                  <strong>Free</strong> - No hidden charges
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Value Your Car?</h2>
            <p className="mb-6">Start with our valuation engine above and get an instant estimate</p>
            <p className="text-sm opacity-90">
              💡 Use this valuation to price your car competitively and attract more buyers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
