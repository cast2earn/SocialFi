export interface Database {
  public: {
    Tables: {
      user_points: {
        Row: {
          id: number
          fid: string
          points: number
          last_check_in: string
          created_at: string
          updated_at: string
        }
        Insert: {
          fid: string
          points: number
          last_check_in: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          points?: number
          last_check_in?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: number
          fid: string
          username: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          fid: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
    }
  }
} 