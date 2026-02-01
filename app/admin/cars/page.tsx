'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin, getAllCars, setCarStatus } from '@/lib/admin-service';
import { Car } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'live' | 'sold'>('all');

  useEffect(() => {
    checkAndLoad();
  }, []);

  const checkAndLoad = async () => {
    setLoading(true);
    const admin = await isAdmin();
    if (!admin) {
      router.push('/home');
      return;
    }

    setAuthorized(true);
    const data = await getAllCars();
    setCars(data.data || []);
    setLoading(false);
  };

  const handleStatusChange = async (carId: string, newStatus: 'draft' | 'live' | 'sold') => {
    await setCarStatus(carId, newStatus);
    setCars(cars.map((c) => (c.id === carId ? { ...c, status: newStatus } : c)));
  };

  const filteredCars = filter === 'all' ? cars : cars.filter((c) => c.status === filter);

  const stats = {
    total: cars.length,
    draft: cars.filter((c) => c.status === 'draft').length,
    live: cars.filter((c) => c.status === 'live').length,
    sold: cars.filter((c) => c.status === 'sold').length,
  };

  if (!authorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Car Moderation</h1>
          <p className="text-gray-600 mt-2">Total cars: {cars.length}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Live</p>
            <p className="text-2xl font-bold text-green-600">{stats.live}</p>
          </div>
          <div className="bg-gray-100 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Sold</p>
            <p className="text-2xl font-bold text-gray-800">{stats.sold}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['all', 'draft', 'live', 'sold'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {filteredCars.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-600">
            No {filter === 'all' ? '' : filter} cars.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    {/* Car Details */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{car.title}</p>
                        <p className="text-sm text-gray-600">
                          {car.year} {car.brand} {car.model}
                        </p>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatPrice(car.price)}
                    </td>

                    {/* City */}
                    <td className="px-6 py-4 text-gray-600">{car.city}</td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          car.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : car.status === 'live'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {car.status === 'draft' ? '⚫ Draft' : car.status === 'live' ? '🟢 Live' : 'Sold'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 space-y-1">
                      {car.status !== 'live' && (
                        <button
                          onClick={() => handleStatusChange(car.id, 'live')}
                          className="block text-green-600 hover:text-green-800 font-semibold text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {car.status !== 'sold' && (
                        <button
                          onClick={() => handleStatusChange(car.id, 'sold')}
                          className="block text-gray-600 hover:text-gray-800 font-semibold text-xs"
                        >
                          Mark Sold
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
