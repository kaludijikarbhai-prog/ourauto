// This is a minimal Database type for Supabase client typing.
// Add your full schema here for better type safety.

export type Database = {
  public: {
    Tables: {
      offers: {
        Row: {
          id: string;
          car_id: string;
          seller_id: string;
          buyer_id: string;
          offer_price: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          seller_id: string;
          buyer_id: string;
          offer_price: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          seller_id?: string;
          buyer_id?: string;
          offer_price?: number;
          status?: string;
          created_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          price: number;
          brand: string;
          model: string;
          year: number;
          km: number;
          city: string;
          fuel: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          price: number;
          brand: string;
          model: string;
          year: number;
          km: number;
          city: string;
          fuel: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          price?: number;
          brand?: string;
          model?: string;
          year?: number;
          km?: number;
          city?: string;
          fuel?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
};
