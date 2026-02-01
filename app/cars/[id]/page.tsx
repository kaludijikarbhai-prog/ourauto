'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCarListing, updateCarListing, deleteCarListing, CarListing } from '@/lib/car-listing';
import { getUser } from '@/lib/auth';

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getUser();
      setUser(currentUser);

      const carData = await getCarListing(carId);
      setCar(carData);
      setLoading(false);
    };

    loadData();
  }, [carId]);

  const isOwner = user && car && user.id === car.user_id;

  const handleStatusChange = async (newStatus: string) => {
    if (!car) return;

    try {
      setError('');
      const result = await updateCarListing(car.id, { status: newStatus });
      if (result.error) {
        setError(result.error);
      } else {
        setCar(result.car);
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!car || !confirm('Are you sure?')) return;

    try {
      setDeleting(true);
      const result = await deleteCarListing(car.id);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/my-cars');
      }
    } catch (err) {
      setError('Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-gray-50 py-8"><div className="text-center">Loading...</div></main>;
  }

  if (!car) {
    return <main className="min-h-screen bg-gray-50 py-8"><div className="text-center">Car not found</div></main>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            {car.photoUrls.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={car.photoUrls[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {car.photoUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {car.photoUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Car photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">No photos available</p>
              </div>
            )}

            {/* Details */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {car.year} {car.brand} {car.model}
              </h1>

              <p className="text-4xl font-bold text-blue-600 mb-6">
                {formatPrice(car.price)}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Kilometers</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {car.km.toLocaleString('en-IN')} KM
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Owners</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {car.owners}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Transmission</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">
                    {car.transmission}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Fuel Type</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">
                    {car.fuelType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">City</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {car.city}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">
                    {car.status}
                  </p>
                </div>
              </div>

              {car.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {car.description}
                  </p>
                </div>
              )}

              {car.rcDocUrl && (
                <div className="mt-6">
                  <a
                    href={car.rcDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    📄 View RC Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Seller
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-4">
                {car.phoneNumber}
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
                Call Seller
              </button>
            </div>

            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Listing
                </h3>

                {car.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange('sold')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg text-sm"
                  >
                    Mark as Sold
                  </button>
                )}

                {car.status === 'sold' && (
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg text-sm"
                  >
                    Reactivate
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg text-sm"
                >
                  {deleting ? 'Deleting...' : 'Delete Listing'}
                </button>

                {error && (
                  <p className="text-red-600 text-sm p-3 bg-red-50 rounded">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
