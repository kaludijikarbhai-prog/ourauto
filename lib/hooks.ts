/**
 * Custom React hooks for OurAuto
 */

import { useEffect, useState, useCallback } from 'react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getUserWishlist, isInWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist-service';
import { WishlistWithCar } from '@/lib/types';
import { supabase } from '@/lib/supabase';

/**
 * Hook to check authentication
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authStatus = await isAuthenticated();
    setAuthenticated(authStatus);

    if (authStatus) {
      const userProfile = await getUser();
      setUser(userProfile);
    }

    setLoading(false);
  };

  return { user, loading, authenticated };
}

/**
 * Hook to manage wishlist
 */
export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistWithCar[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    const data = await getUserWishlist();
    setWishlist(data);
    setLoading(false);
  }, []);

  const addWish = useCallback(
    async (carId: string) => {
      const result = await addToWishlist(carId);
      if (!result.error) {
        await loadWishlist();
      }
      return result;
    },
    [loadWishlist]
  );

  const removeWish = useCallback(
    async (carId: string) => {
      const result = await removeFromWishlist(carId);
      if (!result.error) {
        setWishlist(wishlist.filter((item) => item.car_id !== carId));
      }
      return result;
    },
    [wishlist]
  );

  const checkWishlist = useCallback(
    async (carId: string) => {
      return await isInWishlist(carId);
    },
    []
  );

  return {
    wishlist,
    loading,
    loadWishlist,
    addWish,
    removeWish,
    checkWishlist,
  };
}

/**
 * Hook for API calls with loading and error states
 */
export function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, execute };
}

/**
 * Hook for debounced search
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to get user's location
 */
export function useLocation() {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location from profile
    const getUserCity = async () => {
      try {
        const user = await getUser();
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('city')
            .eq('id', user.id)
            .single();
          if (profile?.city) {
            setCity(profile.city);
          }
        }
      } catch (error) {
        console.error('Error getting user city:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserCity();
  }, []);

  return { city, loading };
}
