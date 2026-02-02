'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserWishlist, removeFromWishlist } from '@/lib/wishlist-service';
import type { WishlistWithCar } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistWithCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    // Get userId from Supabase auth
    const { createBrowserClient } = await import('@supabase/auth-helpers-nextjs');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) {
      setWishlist([]);
      setLoading(false);
      return;
    }
    const data = await getUserWishlist(userId);
    setWishlist(data);
    setLoading(false);
  };

  const handleRemove = async (carId: string) => {
    await removeFromWishlist(carId);
    await loadWishlist();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">{wishlist.length} saved cars</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your wishlist...</div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't saved any cars yet</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Browse Cars
            </button>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-4xl">🚗</span>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.car.title}</h3>

                  {/* Details */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>
                      <strong className="text-gray-900">{formatPrice(item.car.price)}</strong>
                    </p>
                    <p>🏙️ {item.car.city}</p>
                    <p>📅 {new Date(item.car.created_at).toLocaleDateString('en-IN')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/cars/${item.car_id}`)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 font-semibold"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleRemove(item.car_id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700 font-semibold"
                    >
                      Remove
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
