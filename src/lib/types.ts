export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          phone_number: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name: string
          phone_number: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          phone_number?: string
          user_id?: string
        }
      }
    }
  }
} 