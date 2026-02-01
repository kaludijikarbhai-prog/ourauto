'use client';

import { useEffect, useState } from 'react';
import { searchCars } from '@/lib/user-service';
import { CarWithImages, CarSearchParams } from '@/lib/types';
import { formatPrice, formatKm } from '@/lib/utils';

export default function HomePage() {
  const [cars, setCars] = useState<CarWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<CarSearchParams>({});

  useEffect(() => {
    loadCars();
  }, [searchParams]);

  const loadCars = async () => {
    setLoading(true);
    const result = await searchCars(searchParams);
    setCars(result.data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Car</h1>
          <p className="text-lg text-gray-600 mb-8">Browse trusted car listings with verified details</p>

          {/* Search Filters */}
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Brand"
              className="px-4 py-2 border rounded"
              onChange={(e) => setSearchParams({ ...searchParams, brand: e.target.value })}
            />
            <input
              type="number"
              placeholder="Min Price"
              className="px-4 py-2 border rounded"
              onChange={(e) =>
                setSearchParams({ ...searchParams, minPrice: parseInt(e.target.value) || undefined })
              }
            />
            <input
              type="number"
              placeholder="Max Price"
              className="px-4 py-2 border rounded"
              onChange={(e) =>
                setSearchParams({ ...searchParams, maxPrice: parseInt(e.target.value) || undefined })
              }
            />
            <select
              className="px-4 py-2 border rounded"
              onChange={(e) => setSearchParams({ ...searchParams, sort: e.target.value as any })}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="km_low">KM: Low to High</option>
            </select>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">Loading cars...</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No cars found</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                {/* Car Image */}
                <div className="w-full h-48 bg-gray-200">
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[0].image_url}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>

                {/* Car Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {car.brand} {car.model} ({car.year})
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Price:</strong> {formatPrice(car.price)}
                    </p>
                    <p>
                      <strong>KM:</strong> {formatKm(car.km)}
                    </p>
                    <p>
                      <strong>City:</strong> {car.city || 'N/A'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-900 py-2 rounded hover:bg-gray-300">
                      Wishlist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
