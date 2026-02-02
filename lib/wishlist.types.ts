// Shared API response type for service functions
export type ApiResponse<T> = {
  data: T | null;
  error?: string | null;
};

// Wishlist row type (should match your Supabase wishlist table schema)
export type Wishlist = {
  id: string;
  user_id: string;
  car_id: string;
  created_at: string;
};

// WishlistWithCar type for joined car info (customize as needed)
export type WishlistWithCar = Wishlist & {
  car: {
    id: string;
    title?: string | null;
    brand?: string | null;
    model?: string | null;
    year?: number | null;
    price?: number | null;
    // ...add more fields as needed
  };
};
