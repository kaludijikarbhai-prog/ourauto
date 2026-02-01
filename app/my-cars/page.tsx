'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserListings, publishCarListing, unpublishCarListing, deleteCarListing } from '@/lib/user-service';
import { UserListing } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function MyCarsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const data = await getUserListings();
    setListings(data);
    setLoading(false);
  };

  const handlePublish = async (carId: string) => {
    const result = await publishCarListing(carId);
    if (!result.error) {
      await loadListings();
    }
  };

  const handleUnpublish = async (carId: string) => {
    const result = await unpublishCarListing(carId);
    if (!result.error) {
      await loadListings();
    }
  };

  const handleDelete = async (carId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      const result = await deleteCarListing(carId);
      if (!result.error) {
        await loadListings();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Car Listings</h1>
            <p className="text-gray-600 mt-2">{listings.length} total listings</p>
          </div>
          <button
            onClick={() => router.push('/sell')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Add New Car
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't listed any cars yet</p>
            <button
              onClick={() => router.push('/sell')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              List Your First Car
            </button>
          </div>
        ) : (
          /* Listings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {/* Image */}
                <div className="w-full h-48 bg-gray-200 relative">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0].image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        listing.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {listing.status === 'live' ? '🟢 Live' : '⚫ Draft'}
                    </span>
                  </div>

                  {/* Image Count */}
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {listing.images?.length || 0} photos
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{listing.title}</h3>

                  {/* Details */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Brand:</strong> {listing.brand}
                    </p>
                    <p>
                      <strong>Price:</strong> {formatPrice(listing.price)}
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(listing.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {listing.status === 'draft' ? (
                      <button
                        onClick={() => handlePublish(listing.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 font-semibold"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(listing.id)}
                        className="flex-1 bg-yellow-600 text-white py-2 rounded text-sm hover:bg-yellow-700 font-semibold"
                      >
                        Unpublish
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/cars/${listing.id}/edit`)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
