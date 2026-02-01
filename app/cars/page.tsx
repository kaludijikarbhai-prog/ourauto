'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAllCars,
  searchCars,
  CAR_BRANDS,
  FUEL_TYPES,
  TRANSMISSIONS,
  POPULAR_CITIES,
  CarListing,
} from '@/lib/car-listing';

export default function CarsPage() {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    brand: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    fuelType: '',
    transmission: '',
  });

  const loadCars = async (pageNum: number = 1, applyFilters: boolean = true) => {
    setLoading(true);
    let result;

    if (
      applyFilters &&
      (filters.brand ||
        filters.city ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.fuelType ||
        filters.transmission)
    ) {
      result = await searchCars({
        brand: filters.brand || undefined,
        city: filters.city || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        fuelType: filters.fuelType || undefined,
        transmission: filters.transmission || undefined,
        page: pageNum,
        limit: 12,
      });
    } else {
      result = await getAllCars(pageNum, 12);
    }

    setCars(result.cars);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => {
    loadCars(1);
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCars(1, true);
  };

  const handleReset = () => {
    setFilters({
      brand: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      fuelType: '',
      transmission: '',
    });
    setPage(1);
    loadCars(1, false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Cars
          </h1>
          <p className="text-gray-600">
            Found {total} cars available
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All brands</option>
                  {CAR_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All cities</option>
                  {POPULAR_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="10000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All fuel types</option>
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission
                </label>
                <select
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All types</option>
                  {TRANSMISSIONS.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg text-sm"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <p className="text-gray-600">Loading cars...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No cars found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <Link
                      key={car.id}
                      href={`/cars/${car.id}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden transition"
                    >
                      {/* Image */}
                      {car.photoUrls.length > 0 && (
                        <div className="relative w-full h-48 bg-gray-200">
                          <img
                            src={car.photoUrls[0]}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Details */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {car.year} {car.brand} {car.model}
                        </h3>

                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {formatPrice(car.price)}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-gray-600">
                          <div>
                            {car.km.toLocaleString('en-IN')} KM
                          </div>
                          <div>{car.transmission}</div>
                          <div>{car.fuelType}</div>
                          <div>{car.city}</div>
                        </div>

                        {car.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {car.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setPage(pageNum);
                            loadCars(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
