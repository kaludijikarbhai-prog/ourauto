// Unified Database type for Supabase
export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          owner_id: string | null
          title: string | null
          brand: string | null
          model: string | null
          year: number | null
          km: number | null
          fuel: string | null
          city: string | null
          price: number | null
          status: string | null
          description: string | null
          images: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          title?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          km?: number | null
          fuel?: string | null
          city?: string | null
          price?: number | null
          status?: string | null
          description?: string | null
          images?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          title?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          km?: number | null
          fuel?: string | null
          city?: string | null
          price?: number | null
          status?: string | null
          description?: string | null
          images?: string[] | null
          created_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          car_id: string
          buyer_id: string
          seller_id: string
          price: number
          message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          car_id: string
          buyer_id: string
          seller_id: string
          price: number
          message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          car_id?: string
          buyer_id?: string
          seller_id?: string
          price?: number
          message?: string | null
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          car_id: string
          inspector_id: string
          status: string
          scheduled_at: string
          completed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          car_id: string
          inspector_id: string
          status: string
          scheduled_at: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          inspector_id?: string
          status?: string
          scheduled_at?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
