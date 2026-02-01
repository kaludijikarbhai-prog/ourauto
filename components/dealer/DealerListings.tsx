'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDealerCars } from '@/lib/dealer';
import { supabase } from '@/lib/supabase';
import { Car } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function DealerListings() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    const data = await getDealerCars();
    setCars(data);
    setLoading(false);
  };

  const handleToggleStatus = async (carId: string, currentStatus: string) => {
    setToggling(carId);
    try {
      const newStatus = currentStatus === 'live' ? 'draft' : 'live';

      const { error } = await supabase
        .from('cars')
        .update({ status: newStatus })
        .eq('id', carId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update car status');
        return;
      }

      // Update local state
      setCars(
        cars.map((car) =>
          car.id === carId ? { ...car, status: newStatus } : car
        )
      );
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update car status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car listing?')) {
      return;
    }

    setDeleting(carId);
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete car listing');
        return;
      }

      // Update local state
      setCars(cars.filter((car) => car.id !== carId));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete car listing');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
            <p className="mt-4">Loading your inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
            <p className="text-gray-600 mt-2">
              {cars.length} car{cars.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <button
            onClick={() => router.push('/sell')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
          >
            + Add New Car
          </button>
        </div>

        {/* Empty State */}
        {cars.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No cars listed yet</h2>
            <p className="text-gray-600 mb-6">Start selling by adding your first car</p>
            <button
              onClick={() => router.push('/sell')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              Add First Car
            </button>
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Car Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Mileage
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      {/* Car Info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {car.year} {car.brand} {car.model}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{car.title}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{formatPrice(car.price)}</p>
                      </td>

                      {/* Mileage */}
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {car.km?.toLocaleString('en-IN') || '-'} km
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-gray-600 text-sm">{car.city}</td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            car.status === 'live'
                              ? 'bg-green-100 text-green-800'
                              : car.status === 'sold'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2 bg-current"></span>
                          {car.status === 'live'
                            ? 'Live'
                            : car.status === 'sold'
                              ? 'Sold'
                              : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => router.push(`/cars/${car.id}`)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 font-medium transition-colors"
                          >
                            View
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(car.id, car.status)}
                            disabled={toggling === car.id}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              car.status === 'live'
                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            } ${toggling === car.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {toggling === car.id ? '...' : car.status === 'live' ? 'Unpublish' : 'Publish'}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => router.push(`/cars/edit/${car.id}`)}
                            className="px-3 py-1 bg-purple-50 text-purple-600 rounded text-sm hover:bg-purple-100 font-medium transition-colors"
                          >
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(car.id)}
                            disabled={deleting === car.id}
                            className={`px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 font-medium transition-colors ${
                              deleting === car.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {deleting === car.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {cars.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Live Listings</p>
              <p className="text-2xl font-bold text-green-600">
                {cars.filter((c) => c.status === 'live').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(cars.reduce((sum, c) => sum + (c.price || 0), 0))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
