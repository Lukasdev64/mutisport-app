export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          name: string
          location: string
          tournament_date: string
          description: string | null
          format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
          sport: string
          players_count: number
          status: 'setup' | 'in_progress' | 'completed' | 'cancelled'
          current_round: number
          total_rounds: number | null
          unique_url_code: string
          edit_token_hash: string | null
          owner_id: string | null
          is_public: boolean
          views_count: number
          last_viewed_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
          archived: boolean
          settings: Json
        }
        Insert: {
          id?: string
          name: string
          location: string
          tournament_date: string
          description?: string | null
          format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
          sport?: string
          players_count: number
          status?: 'setup' | 'in_progress' | 'completed' | 'cancelled'
          current_round?: number
          total_rounds?: number | null
          unique_url_code?: string
          edit_token_hash?: string | null
          owner_id?: string | null
          is_public?: boolean
          views_count?: number
          last_viewed_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
          archived?: boolean
          settings?: Json
        }
        Update: {
          id?: string
          name?: string
          location?: string
          tournament_date?: string
          description?: string | null
          format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
          sport?: string
          players_count?: number
          status?: 'setup' | 'in_progress' | 'completed' | 'cancelled'
          current_round?: number
          total_rounds?: number | null
          unique_url_code?: string
          edit_token_hash?: string | null
          owner_id?: string | null
          is_public?: boolean
          views_count?: number
          last_viewed_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
          archived?: boolean
          settings?: Json
        }
      }
      players: {
        Row: {
          id: string
          name: string
          email: string | null
          avatar: string | null
          age: number | null
          rank: string | null
          registration_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          avatar?: string | null
          age?: number | null
          rank?: string | null
          registration_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          avatar?: string | null
          age?: number | null
          rank?: string | null
          registration_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      tournament_players: {
        Row: {
          tournament_id: string
          player_id: string
          seed: number | null
          status: 'active' | 'eliminated' | 'withdrawn'
          created_at: string
        }
        Insert: {
          tournament_id: string
          player_id: string
          seed?: number | null
          status?: 'active' | 'eliminated' | 'withdrawn'
          created_at?: string
        }
        Update: {
          tournament_id?: string
          player_id?: string
          seed?: number | null
          status?: 'active' | 'eliminated' | 'withdrawn'
          created_at?: string
        }
      }
      rounds: {
        Row: {
          id: string
          tournament_id: string
          number: number
          name: string
          status: 'pending' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          number: number
          name: string
          status?: 'pending' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          number?: number
          name?: string
          status?: 'pending' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round_id: string
          player1_id: string | null
          player2_id: string | null
          winner_id: string | null
          player1_score: number | null
          player2_score: number | null
          status: 'pending' | 'scheduled' | 'in_progress' | 'completed'
          next_match_id: string | null
          scheduled_at: string | null
          location: string | null
          court_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round_id: string
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          player1_score?: number | null
          player2_score?: number | null
          status?: 'pending' | 'scheduled' | 'in_progress' | 'completed'
          next_match_id?: string | null
          scheduled_at?: string | null
          location?: string | null
          court_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round_id?: string
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          player1_score?: number | null
          player2_score?: number | null
          status?: 'pending' | 'scheduled' | 'in_progress' | 'completed'
          next_match_id?: string | null
          scheduled_at?: string | null
          location?: string | null
          court_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_owner_id: string
          user_id: string | null
          email: string
          role: 'admin' | 'editor' | 'viewer'
          status: 'pending' | 'active' | 'declined'
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_owner_id: string
          user_id?: string | null
          email: string
          role?: 'admin' | 'editor' | 'viewer'
          status?: 'pending' | 'active' | 'declined'
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_owner_id?: string
          user_id?: string | null
          email?: string
          role?: 'admin' | 'editor' | 'viewer'
          status?: 'pending' | 'active' | 'declined'
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
