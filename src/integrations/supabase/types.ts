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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          action_type: string
          category: string
          created_at: string
          id: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          action_type?: string
          category?: string
          created_at?: string
          id?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          action_type?: string
          category?: string
          created_at?: string
          id?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          bg_color_class: string
          color_class: string
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          bg_color_class?: string
          color_class?: string
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          bg_color_class?: string
          color_class?: string
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      competitor_data: {
        Row: {
          competitor_name: string
          competitor_url: string
          content_gaps: string[]
          created_at: string
          id: string
          keywords: string[]
          last_scanned_at: string | null
          platform: string
          posting_frequency: string
          suggested_topics: string[]
          top_posts: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          competitor_name?: string
          competitor_url?: string
          content_gaps?: string[]
          created_at?: string
          id?: string
          keywords?: string[]
          last_scanned_at?: string | null
          platform?: string
          posting_frequency?: string
          suggested_topics?: string[]
          top_posts?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          competitor_name?: string
          competitor_url?: string
          content_gaps?: string[]
          created_at?: string
          id?: string
          keywords?: string[]
          last_scanned_at?: string | null
          platform?: string
          posting_frequency?: string
          suggested_topics?: string[]
          top_posts?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_suggestions: {
        Row: {
          content: string
          created_at: string
          id: string
          is_used: boolean
          keywords: string[]
          platform: string
          score: number
          suggestion_type: string
          tone: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_used?: boolean
          keywords?: string[]
          platform?: string
          score?: number
          suggestion_type?: string
          tone?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_used?: boolean
          keywords?: string[]
          platform?: string
          score?: number
          suggestion_type?: string
          tone?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donor_name: string | null
          email: string
          id: string
          message: string | null
          paypal_order_id: string | null
          paypal_payer_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donor_name?: string | null
          email: string
          id?: string
          message?: string | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donor_name?: string | null
          email?: string
          id?: string
          message?: string | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mfa_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used: boolean
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used?: boolean
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          ai_features_enabled: string[]
          ai_image_generations_per_day: number
          ai_replies_per_day: number
          ai_text_generations_per_day: number
          ai_video_generations_per_day: number
          created_at: string
          description: string
          display_order: number
          features_enabled: string[]
          id: string
          is_active: boolean
          max_channels: number
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          updated_at: string
        }
        Insert: {
          ai_features_enabled?: string[]
          ai_image_generations_per_day?: number
          ai_replies_per_day?: number
          ai_text_generations_per_day?: number
          ai_video_generations_per_day?: number
          created_at?: string
          description?: string
          display_order?: number
          features_enabled?: string[]
          id: string
          is_active?: boolean
          max_channels?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
          updated_at?: string
        }
        Update: {
          ai_features_enabled?: string[]
          ai_image_generations_per_day?: number
          ai_replies_per_day?: number
          ai_text_generations_per_day?: number
          ai_video_generations_per_day?: number
          created_at?: string
          description?: string
          display_order?: number
          features_enabled?: string[]
          id?: string
          is_active?: boolean
          max_channels?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          donor_since: string | null
          id: string
          is_donor: boolean
          total_donated: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          donor_since?: string | null
          id: string
          is_donor?: boolean
          total_donated?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          donor_since?: string | null
          id?: string
          is_donor?: boolean
          total_donated?: number
          updated_at?: string
        }
        Relationships: []
      }
      published_posts: {
        Row: {
          content: string
          created_at: string
          engagement_clicks: number
          engagement_comments: number
          engagement_likes: number
          engagement_shares: number
          external_post_id: string | null
          id: string
          media_urls: string[]
          platform: string
          published_at: string
          scheduled_post_id: string | null
          social_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          engagement_clicks?: number
          engagement_comments?: number
          engagement_likes?: number
          engagement_shares?: number
          external_post_id?: string | null
          id?: string
          media_urls?: string[]
          platform?: string
          published_at?: string
          scheduled_post_id?: string | null
          social_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement_clicks?: number
          engagement_comments?: number
          engagement_likes?: number
          engagement_shares?: number
          external_post_id?: string | null
          id?: string
          media_urls?: string[]
          platform?: string
          published_at?: string
          scheduled_post_id?: string | null
          social_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_posts_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          ai_generated: boolean
          content: string
          created_at: string
          hashtags: string[]
          id: string
          is_recurring: boolean
          media_urls: string[]
          platform: string
          recurrence_rule: string | null
          scheduled_at: string
          social_account_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          content?: string
          created_at?: string
          hashtags?: string[]
          id?: string
          is_recurring?: boolean
          media_urls?: string[]
          platform?: string
          recurrence_rule?: string | null
          scheduled_at: string
          social_account_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          content?: string
          created_at?: string
          hashtags?: string[]
          id?: string
          is_recurring?: boolean
          media_urls?: string[]
          platform?: string
          recurrence_rule?: string | null
          scheduled_at?: string
          social_account_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string
          account_id: string
          account_name: string
          account_type: string
          capabilities: string[]
          connection_mode: string
          created_at: string
          id: string
          is_connected: boolean
          platform: string
          provider_metadata: Json
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string
          account_id?: string
          account_name?: string
          account_type?: string
          capabilities?: string[]
          connection_mode?: string
          created_at?: string
          id?: string
          is_connected?: boolean
          platform: string
          provider_metadata?: Json
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_name?: string
          account_type?: string
          capabilities?: string[]
          connection_mode?: string
          created_at?: string
          id?: string
          is_connected?: boolean
          platform?: string
          provider_metadata?: Json
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          id: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_examples: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          tool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_examples_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_purchases: {
        Row: {
          amount: number
          commission: number
          created_at: string
          id: string
          paypal_order_id: string | null
          paypal_payer_id: string | null
          status: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          commission: number
          created_at?: string
          id?: string
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          commission?: number
          created_at?: string
          id?: string
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          badge: string | null
          base_price: number
          category_id: string
          created_at: string
          features: string[]
          full_description: string
          id: string
          image_url: string
          input_types: string[]
          is_featured: boolean
          is_official: boolean
          is_popular: boolean
          model_type: string
          output_types: string[]
          pricing_text: string
          pricing_type: string
          provider: string
          short_description: string
          slug: string
          subcategory_id: string
          tags: string[]
          title: string
          updated_at: string
          use_cases: string[]
          website_url: string
        }
        Insert: {
          badge?: string | null
          base_price?: number
          category_id: string
          created_at?: string
          features?: string[]
          full_description?: string
          id: string
          image_url?: string
          input_types?: string[]
          is_featured?: boolean
          is_official?: boolean
          is_popular?: boolean
          model_type?: string
          output_types?: string[]
          pricing_text?: string
          pricing_type?: string
          provider?: string
          short_description?: string
          slug: string
          subcategory_id: string
          tags?: string[]
          title: string
          updated_at?: string
          use_cases?: string[]
          website_url?: string
        }
        Update: {
          badge?: string | null
          base_price?: number
          category_id?: string
          created_at?: string
          features?: string[]
          full_description?: string
          id?: string
          image_url?: string
          input_types?: string[]
          is_featured?: boolean
          is_official?: boolean
          is_popular?: boolean
          model_type?: string
          output_types?: string[]
          pricing_text?: string
          pricing_type?: string
          provider?: string
          short_description?: string
          slug?: string
          subcategory_id?: string
          tags?: string[]
          title?: string
          updated_at?: string
          use_cases?: string[]
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ai_usage_today: {
        Args: { _user_id: string }
        Returns: {
          action_type: string
          category: string
          usage_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
