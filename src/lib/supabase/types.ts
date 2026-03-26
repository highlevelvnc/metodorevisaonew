export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'student' | 'reviewer' | 'admin'
export type EssayStatus = 'pending' | 'in_review' | 'corrected'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          avatar_url: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_brl: number
          essay_count: number
          features: Json
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price_brl: number
          essay_count: number
          features?: Json
          active?: boolean
          created_at?: string
        }
        Update: { name?: string; price_brl?: number; essay_count?: number; features?: Json; active?: boolean }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: SubscriptionStatus
          essays_used: number
          essays_limit: number
          started_at: string
          expires_at: string | null
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: SubscriptionStatus
          essays_used?: number
          essays_limit: number
          started_at?: string
          expires_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          created_at?: string
        }
        Update: {
          status?: SubscriptionStatus
          essays_used?: number
          expires_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
        }
      }
      themes: {
        Row: {
          id: string
          title: string
          source: string | null
          year: number | null
          active: boolean
          created_at: string
        }
        Insert: { id?: string; title: string; source?: string | null; year?: number | null; active?: boolean; created_at?: string }
        Update: { title?: string; source?: string | null; active?: boolean }
      }
      essays: {
        Row: {
          id: string
          student_id: string
          theme_id: string | null
          theme_title: string
          content_text: string | null
          notes: string | null
          status: EssayStatus
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          theme_id?: string | null
          theme_title: string
          content_text?: string | null
          notes?: string | null
          status?: EssayStatus
          submitted_at?: string
          created_at?: string
        }
        Update: { theme_title?: string; status?: EssayStatus; notes?: string | null }
      }
      corrections: {
        Row: {
          id: string
          essay_id: string
          reviewer_id: string
          reviewer_name: string
          c1_score: number
          c2_score: number
          c3_score: number
          c4_score: number
          c5_score: number
          total_score: number
          general_feedback: string
          annotations: Json
          corrected_at: string
          created_at: string
        }
        Insert: {
          id?: string
          essay_id: string
          reviewer_id: string
          reviewer_name?: string
          c1_score: number
          c2_score: number
          c3_score: number
          c4_score: number
          c5_score: number
          total_score: number
          general_feedback: string
          annotations?: Json
          corrected_at?: string
          created_at?: string
        }
        Update: {
          reviewer_id?: string
          reviewer_name?: string
          c1_score?: number
          c2_score?: number
          c3_score?: number
          c4_score?: number
          c5_score?: number
          total_score?: number
          general_feedback?: string
          annotations?: Json
          corrected_at?: string
        }
      }
    }
    Views: {
      student_progress: {
        Row: {
          student_id: string
          total_essays: number
          corrected_essays: number
          avg_total: number | null
          avg_c1: number | null; avg_c2: number | null; avg_c3: number | null
          avg_c4: number | null; avg_c5: number | null
          last_essay_at: string | null
        }
      }
    }
    Functions: Record<string, never>
    Enums: { user_role: UserRole; essay_status: EssayStatus; subscription_status: SubscriptionStatus }
  }
}

// ─── Convenience types for use in pages ───────────────────────────────────────
export type UserRow         = Database['public']['Tables']['users']['Row']
export type PlanRow         = Database['public']['Tables']['plans']['Row']
export type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
export type ThemeRow        = Database['public']['Tables']['themes']['Row']
export type EssayRow        = Database['public']['Tables']['essays']['Row']
export type CorrectionRow   = Database['public']['Tables']['corrections']['Row']

/** Essay with its correction (if any) */
export type EssayWithCorrection = EssayRow & {
  corrections: CorrectionRow | null
}

/** Essay enriched with student profile — used in admin views */
export type EssayWithStudent = EssayRow & {
  student: Pick<UserRow, 'id' | 'full_name' | 'email'> | null
  corrections: CorrectionRow | null
}

/** Subscription enriched with plan name */
export type SubscriptionWithPlan = SubscriptionRow & {
  plans: Pick<PlanRow, 'name' | 'slug' | 'essay_count'> | null
}
