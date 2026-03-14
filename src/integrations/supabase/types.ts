export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      animal_definitions: {
        Row: {
          animal_type: string
          emoji: string
          id: string
          passive_ability_description: string
          passive_ability_logic: Json
          passive_ability_name: string
          stage_1_exp: number
          stage_2_exp: number
          stage_3_exp: number
          stage_4_exp: number
        }
        Insert: {
          animal_type: string
          emoji?: string
          id?: string
          passive_ability_description: string
          passive_ability_logic?: Json
          passive_ability_name: string
          stage_1_exp?: number
          stage_2_exp?: number
          stage_3_exp?: number
          stage_4_exp?: number
        }
        Update: {
          animal_type?: string
          emoji?: string
          id?: string
          passive_ability_description?: string
          passive_ability_logic?: Json
          passive_ability_name?: string
          stage_1_exp?: number
          stage_2_exp?: number
          stage_3_exp?: number
          stage_4_exp?: number
        }
        Relationships: []
      }
      book_votes: {
        Row: {
          book_id: string
          id: string
          rating: number
          review: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          id?: string
          rating: number
          review?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          id?: string
          rating?: number
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_votes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_of_week"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books_of_week: {
        Row: {
          affiliate_link: string | null
          author: string
          average_rating: number | null
          cover_url: string | null
          created_at: string
          id: string
          title: string
          type: string
          week_number: number
        }
        Insert: {
          affiliate_link?: string | null
          author: string
          average_rating?: number | null
          cover_url?: string | null
          created_at?: string
          id?: string
          title: string
          type?: string
          week_number: number
        }
        Update: {
          affiliate_link?: string | null
          author?: string
          average_rating?: number | null
          cover_url?: string | null
          created_at?: string
          id?: string
          title?: string
          type?: string
          week_number?: number
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "platform_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_date: string
          created_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean
          category: string | null
          created_at: string
          emoji: string
          frequency: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string | null
          created_at?: string
          emoji?: string
          frequency?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string | null
          created_at?: string
          emoji?: string
          frequency?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          animal_type: string | null
          coin_price: number
          description: string | null
          effect_type: string
          id: string
          image_url: string | null
          name: string
          rarity: string
        }
        Insert: {
          animal_type?: string | null
          coin_price?: number
          description?: string | null
          effect_type?: string
          id?: string
          image_url?: string | null
          name: string
          rarity?: string
        }
        Update: {
          animal_type?: string | null
          coin_price?: number
          description?: string | null
          effect_type?: string
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_animal_type_fkey"
            columns: ["animal_type"]
            isOneToOne: false
            referencedRelation: "animal_definitions"
            referencedColumns: ["animal_type"]
          },
        ]
      }
      loot_boxes: {
        Row: {
          bonus_chance: number | null
          bonus_rarity: string | null
          coin_price: number
          guaranteed_rarity: string
          id: string
          name: string
        }
        Insert: {
          bonus_chance?: number | null
          bonus_rarity?: string | null
          coin_price: number
          guaranteed_rarity?: string
          id?: string
          name: string
        }
        Update: {
          bonus_chance?: number | null
          bonus_rarity?: string | null
          coin_price?: number
          guaranteed_rarity?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      platform_challenges: {
        Row: {
          coin_reward: number
          description: string | null
          end_date: string | null
          exp_reward: number
          id: string
          item_reward_id: string | null
          start_date: string | null
          title: string
          type: string
        }
        Insert: {
          coin_reward?: number
          description?: string | null
          end_date?: string | null
          exp_reward?: number
          id?: string
          item_reward_id?: string | null
          start_date?: string | null
          title: string
          type?: string
        }
        Update: {
          coin_reward?: number
          description?: string | null
          end_date?: string | null
          exp_reward?: number
          id?: string
          item_reward_id?: string | null
          start_date?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_challenges_item_reward_id_fkey"
            columns: ["item_reward_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          animal_items: Json
          animal_stage: number
          animal_type: string | null
          created_at: string
          current_tournament_id: string | null
          exp: number
          hibernation_days_left: number
          hibernation_used_this_month: boolean
          id: string
          last_active_date: string | null
          onboarding_completed: boolean
          plan: string
          province: string | null
          streak_days: number
          total_coins: number
          updated_at: string
          username: string | null
          weekly_coins: number
        }
        Insert: {
          animal_items?: Json
          animal_stage?: number
          animal_type?: string | null
          created_at?: string
          current_tournament_id?: string | null
          exp?: number
          hibernation_days_left?: number
          hibernation_used_this_month?: boolean
          id: string
          last_active_date?: string | null
          onboarding_completed?: boolean
          plan?: string
          province?: string | null
          streak_days?: number
          total_coins?: number
          updated_at?: string
          username?: string | null
          weekly_coins?: number
        }
        Update: {
          animal_items?: Json
          animal_stage?: number
          animal_type?: string | null
          created_at?: string
          current_tournament_id?: string | null
          exp?: number
          hibernation_days_left?: number
          hibernation_used_this_month?: boolean
          id?: string
          last_active_date?: string | null
          onboarding_completed?: boolean
          plan?: string
          province?: string | null
          streak_days?: number
          total_coins?: number
          updated_at?: string
          username?: string | null
          weekly_coins?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_animal_type_fkey"
            columns: ["animal_type"]
            isOneToOne: false
            referencedRelation: "animal_definitions"
            referencedColumns: ["animal_type"]
          },
          {
            foreignKeyName: "profiles_current_tournament_id_fkey"
            columns: ["current_tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_history: {
        Row: {
          coin_reward: number
          coins_earned: number
          completed_at: string
          exp_reward: number
          final_position: number | null
          id: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          coin_reward?: number
          coins_earned?: number
          completed_at?: string
          exp_reward?: number
          final_position?: number | null
          id?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          coin_reward?: number
          coins_earned?: number
          completed_at?: string
          exp_reward?: number
          final_position?: number | null
          id?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_history_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          coins_earned: number
          dragon_bonus_days: number
          final_position: number | null
          id: string
          masked_position: boolean
          tournament_id: string
          user_id: string
        }
        Insert: {
          coins_earned?: number
          dragon_bonus_days?: number
          final_position?: number | null
          id?: string
          masked_position?: boolean
          tournament_id: string
          user_id: string
        }
        Update: {
          coins_earned?: number
          dragon_bonus_days?: number
          final_position?: number | null
          id?: string
          masked_position?: boolean
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          end_date: string
          id: string
          max_exp: number
          min_exp: number
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date?: string
          id?: string
          max_exp?: number
          min_exp?: number
          start_date?: string
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          max_exp?: number
          min_exp?: number
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_items: {
        Row: {
          acquired_at: string
          id: string
          is_equipped: boolean
          item_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          is_equipped?: boolean
          item_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          is_equipped?: boolean
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_dragon_bonus: { Args: never; Returns: undefined }
      is_in_same_tournament: {
        Args: { _target_user_id: string }
        Returns: boolean
      }
      is_own_user: { Args: { _user_id: string }; Returns: boolean }
      is_tournament_participant: {
        Args: { _tournament_id: string }
        Returns: boolean
      }
      materialize_daily_stats: {
        Args: { p_date: string; p_user_id: string }
        Returns: undefined
      }
      materialize_daily_stats_range: {
        Args: { p_end: string; p_start: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
