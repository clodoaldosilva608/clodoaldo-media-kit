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
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          offer_slug: string | null
          path: string | null
          props: Json
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          offer_slug?: string | null
          path?: string | null
          props?: Json
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          offer_slug?: string | null
          path?: string | null
          props?: Json
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_bundle_items: {
        Row: {
          bundle_id: string
          knowledge_id: string
        }
        Insert: {
          bundle_id: string
          knowledge_id: string
        }
        Update: {
          bundle_id?: string
          knowledge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_bundle_items_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_bundles: {
        Row: {
          access_type: Database["public"]["Enums"]["knowledge_access_type"]
          created_at: string
          currency: string
          description: string
          id: string
          metadata: Json
          price_cents: number
          slug: string
          status: Database["public"]["Enums"]["knowledge_status"]
          stripe_price_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_type?: Database["public"]["Enums"]["knowledge_access_type"]
          created_at?: string
          currency?: string
          description?: string
          id?: string
          metadata?: Json
          price_cents?: number
          slug: string
          status?: Database["public"]["Enums"]["knowledge_status"]
          stripe_price_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_type?: Database["public"]["Enums"]["knowledge_access_type"]
          created_at?: string
          currency?: string
          description?: string
          id?: string
          metadata?: Json
          price_cents?: number
          slug?: string
          status?: Database["public"]["Enums"]["knowledge_status"]
          stripe_price_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_chapters: {
        Row: {
          content_md: string
          created_at: string
          id: string
          is_preview: boolean
          knowledge_id: string
          metadata: Json
          order_index: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content_md?: string
          created_at?: string
          id?: string
          is_preview?: boolean
          knowledge_id: string
          metadata?: Json
          order_index?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content_md?: string
          created_at?: string
          id?: string
          is_preview?: boolean
          knowledge_id?: string
          metadata?: Json
          order_index?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chapters_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_checklists: {
        Row: {
          chapter_id: string
          checked: boolean
          created_at: string
          id: string
          item_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          checked?: boolean
          created_at?: string
          id?: string
          item_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          checked?: boolean
          created_at?: string
          id?: string
          item_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_checklists_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_entitlements: {
        Row: {
          active: boolean
          bundle_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          knowledge_id: string | null
          source: Database["public"]["Enums"]["knowledge_entitlement_source"]
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          bundle_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          knowledge_id?: string | null
          source?: Database["public"]["Enums"]["knowledge_entitlement_source"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          bundle_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          knowledge_id?: string | null
          source?: Database["public"]["Enums"]["knowledge_entitlement_source"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entitlements_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_entitlements_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_favorites: {
        Row: {
          chapter_id: string | null
          created_at: string
          id: string
          knowledge_id: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          knowledge_id: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          knowledge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_favorites_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_favorites_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          access_type: Database["public"]["Enums"]["knowledge_access_type"]
          category: string
          cover_url: string | null
          created_at: string
          currency: string
          description: string
          difficulty: Database["public"]["Enums"]["knowledge_difficulty"]
          estimated_minutes: number
          id: string
          metadata: Json
          order_index: number
          price_cents: number
          slug: string
          status: Database["public"]["Enums"]["knowledge_status"]
          title: string
          type: Database["public"]["Enums"]["knowledge_content_type"]
          updated_at: string
        }
        Insert: {
          access_type?: Database["public"]["Enums"]["knowledge_access_type"]
          category?: string
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["knowledge_difficulty"]
          estimated_minutes?: number
          id?: string
          metadata?: Json
          order_index?: number
          price_cents?: number
          slug: string
          status?: Database["public"]["Enums"]["knowledge_status"]
          title: string
          type?: Database["public"]["Enums"]["knowledge_content_type"]
          updated_at?: string
        }
        Update: {
          access_type?: Database["public"]["Enums"]["knowledge_access_type"]
          category?: string
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["knowledge_difficulty"]
          estimated_minutes?: number
          id?: string
          metadata?: Json
          order_index?: number
          price_cents?: number
          slug?: string
          status?: Database["public"]["Enums"]["knowledge_status"]
          title?: string
          type?: Database["public"]["Enums"]["knowledge_content_type"]
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_notes: {
        Row: {
          anchor: string | null
          chapter_id: string | null
          content: string
          created_at: string
          id: string
          knowledge_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anchor?: string | null
          chapter_id?: string | null
          content?: string
          created_at?: string
          id?: string
          knowledge_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anchor?: string | null
          chapter_id?: string | null
          content?: string
          created_at?: string
          id?: string
          knowledge_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_notes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_notes_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_progress: {
        Row: {
          chapter_id: string
          completed: boolean
          created_at: string
          id: string
          knowledge_id: string
          last_position: number
          last_read_at: string
          progress_pct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed?: boolean
          created_at?: string
          id?: string
          knowledge_id: string
          last_position?: number
          last_read_at?: string
          progress_pct?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          knowledge_id?: string
          last_position?: number
          last_read_at?: string
          progress_pct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_progress_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          consent: boolean
          created_at: string
          ebook_slug: string
          email: string
          id: string
          instagram_follow_intent: boolean
          name: string | null
          source: string
          updated_at: string
        }
        Insert: {
          consent?: boolean
          created_at?: string
          ebook_slug: string
          email: string
          id?: string
          instagram_follow_intent?: boolean
          name?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          consent?: boolean
          created_at?: string
          ebook_slug?: string
          email?: string
          id?: string
          instagram_follow_intent?: boolean
          name?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          audience: string
          category: string
          created_at: string
          cta_href: string
          cta_label: string
          deliverables: Json
          description: string
          entry_level: number
          id: string
          name: string
          order_index: number
          price_label: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          audience?: string
          category?: string
          created_at?: string
          cta_href?: string
          cta_label?: string
          deliverables?: Json
          description?: string
          entry_level?: number
          id?: string
          name: string
          order_index?: number
          price_label?: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          audience?: string
          category?: string
          created_at?: string
          cta_href?: string
          cta_label?: string
          deliverables?: Json
          description?: string
          entry_level?: number
          id?: string
          name?: string
          order_index?: number
          price_label?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          addons: Json
          answers: Json
          bonus_ebooks: Json
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          id: string
          queue_id: string | null
          service_name: string
          service_slug: string
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          total_cents: number
          updated_at: string
        }
        Insert: {
          addons?: Json
          answers?: Json
          bonus_ebooks?: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          queue_id?: string | null
          service_name: string
          service_slug: string
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_cents: number
          updated_at?: string
        }
        Update: {
          addons?: Json
          answers?: Json
          bonus_ebooks?: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          queue_id?: string | null
          service_name?: string
          service_slug?: string
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "service_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          answer_label: string
          answer_value: string
          created_at: string
          id: string
          question_id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          answer_label?: string
          answer_value: string
          created_at?: string
          id?: string
          question_id: string
          session_id: string
          updated_at?: string
        }
        Update: {
          answer_label?: string
          answer_value?: string
          created_at?: string
          id?: string
          question_id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_leads: {
        Row: {
          consent_at: string | null
          consent_contact: boolean
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          preferred_channel: string
          recommended_offer_slug: string | null
          session_id: string | null
          source: string
          updated_at: string
        }
        Insert: {
          consent_at?: string | null
          consent_contact?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          preferred_channel?: string
          recommended_offer_slug?: string | null
          session_id?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          consent_at?: string | null
          consent_contact?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          preferred_channel?: string
          recommended_offer_slug?: string | null
          session_id?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_leads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          created_at: string
          id: string
          primary_offer_slug: string
          profile_key: string
          profile_label: string
          score_breakdown: Json
          secondary_offer_slug: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          primary_offer_slug: string
          profile_key?: string
          profile_label?: string
          score_breakdown?: Json
          secondary_offer_slug?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          primary_offer_slug?: string
          profile_key?: string
          profile_label?: string
          score_breakdown?: Json
          secondary_offer_slug?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_rules: {
        Row: {
          active: boolean
          answer_value: string
          created_at: string
          id: string
          offer_slug: string
          priority: number
          question_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          answer_value: string
          created_at?: string
          id?: string
          offer_slug: string
          priority?: number
          question_id: string
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          answer_value?: string
          created_at?: string
          id?: string
          offer_slug?: string
          priority?: number
          question_id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          device_type: string
          id: string
          source: string
          track: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          device_type?: string
          id?: string
          source?: string
          track?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          device_type?: string
          id?: string
          source?: string
          track?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      service_capacity: {
        Row: {
          active: boolean
          created_at: string
          monthly_slots: number
          service_slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          monthly_slots?: number
          service_slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          monthly_slots?: number
          service_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_queue: {
        Row: {
          created_at: string
          cycle_month: string
          id: string
          order_id: string | null
          position: number
          service_slug: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_month?: string
          id?: string
          order_id?: string | null
          position: number
          service_slug: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_month?: string
          id?: string
          order_id?: string | null
          position?: number
          service_slug?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget_range: string | null
          company: string | null
          created_at: string
          current_url: string | null
          deadline: string | null
          email: string
          goal: string
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          offer_slug: string
          phone: string | null
          session_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          company?: string | null
          created_at?: string
          current_url?: string | null
          deadline?: string | null
          email: string
          goal?: string
          id?: string
          lead_id?: string | null
          name: string
          notes?: string | null
          offer_slug: string
          phone?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          company?: string | null
          created_at?: string
          current_url?: string | null
          deadline?: string | null
          email?: string
          goal?: string
          id?: string
          lead_id?: string | null
          name?: string
          notes?: string | null
          offer_slug?: string
          phone?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          received_at?: string
        }
        Relationships: []
      }
      supporters: {
        Row: {
          amount_cents: number
          app_slug: string
          created_at: string
          id: string
          public_display: boolean
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          supporter_email: string
          supporter_message: string | null
          supporter_name: string
          tier_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          app_slug: string
          created_at?: string
          id?: string
          public_display?: boolean
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          supporter_email: string
          supporter_message?: string | null
          supporter_name: string
          tier_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          app_slug?: string
          created_at?: string
          id?: string
          public_display?: boolean
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          supporter_email?: string
          supporter_message?: string | null
          supporter_name?: string
          tier_id?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_knowledge_access: {
        Args: { _knowledge: string; _user: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      service_queue_join: {
        Args: { _slug: string }
        Returns: {
          available_now: boolean
          cycle: string
          monthly_slots: number
          queue_id: string
          queue_position: number
          queue_status: string
          taken: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      knowledge_access_type: "free" | "one_time" | "subscription" | "lifetime"
      knowledge_content_type:
        | "ebook"
        | "course"
        | "video"
        | "template"
        | "prompt_pack"
        | "tool"
      knowledge_difficulty: "iniciante" | "intermediario" | "avancado"
      knowledge_entitlement_source:
        | "purchase"
        | "subscription"
        | "grant"
        | "lifetime"
      knowledge_status: "draft" | "published" | "archived"
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
      knowledge_access_type: ["free", "one_time", "subscription", "lifetime"],
      knowledge_content_type: [
        "ebook",
        "course",
        "video",
        "template",
        "prompt_pack",
        "tool",
      ],
      knowledge_difficulty: ["iniciante", "intermediario", "avancado"],
      knowledge_entitlement_source: [
        "purchase",
        "subscription",
        "grant",
        "lifetime",
      ],
      knowledge_status: ["draft", "published", "archived"],
    },
  },
} as const
