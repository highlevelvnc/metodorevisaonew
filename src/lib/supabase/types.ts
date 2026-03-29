export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole          = 'student' | 'reviewer' | 'admin'
export type EssayStatus       = 'pending' | 'in_review' | 'corrected'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type LessonStatus      = 'scheduled' | 'completed' | 'cancelled'
export type PayoutStatus      = 'open' | 'closed' | 'paid'
export type PixKeyType        = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'

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
          last_activity_at: string | null
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
          last_activity_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          stripe_customer_id?: string | null
          last_activity_at?: string | null
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
          stripe_subscription_id: string | null
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
          stripe_subscription_id?: string | null
          created_at?: string
        }
        Update: {
          status?: SubscriptionStatus
          essays_used?: number
          expires_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
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
          share_token: string | null
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
          share_token?: string | null
          submitted_at?: string
          created_at?: string
        }
        Update: { theme_title?: string; status?: EssayStatus; notes?: string | null; share_token?: string | null }
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
          viewed_at: string | null
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
          viewed_at?: string | null
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
          viewed_at?: string | null
          corrected_at?: string
        }
      }
      professor_rates: {
        Row: {
          id:            string
          professor_id:  string
          essay_rate:    number
          lesson_rate:   number
          valid_from:    string        // date "YYYY-MM-DD"
          valid_to:      string | null // date "YYYY-MM-DD" or null (currently active)
          created_at:    string
        }
        Insert: {
          id?:           string
          professor_id:  string
          essay_rate?:   number
          lesson_rate?:  number
          valid_from?:   string
          valid_to?:     string | null
          created_at?:   string
        }
        Update: {
          essay_rate?:   number
          lesson_rate?:  number
          valid_to?:     string | null
        }
      }
      lesson_sessions: {
        Row: {
          id:            string
          professor_id:  string
          student_id:    string | null
          session_date:  string        // date "YYYY-MM-DD"
          session_time:  string | null // time "HH:MM"
          duration_min:  number
          topic:         string | null
          subject:       string | null // 'Português' | 'Inglês' | 'Redação' | 'Literatura'
          meet_link:     string | null // Google Meet / Zoom URL
          price_brl:     number | null
          student_name:  string | null
          status:        LessonStatus
          notes:         string | null
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id?:           string
          professor_id:  string
          student_id?:   string | null
          session_date:  string
          session_time?: string | null
          duration_min?: number
          topic?:        string | null
          subject?:      string | null
          meet_link?:    string | null
          price_brl?:    number | null
          student_name?: string | null
          status?:       LessonStatus
          notes?:        string | null
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          session_date?: string
          session_time?: string | null
          duration_min?: number
          topic?:        string | null
          subject?:      string | null
          meet_link?:    string | null
          price_brl?:    number | null
          student_name?: string | null
          status?:       LessonStatus
          notes?:        string | null
          updated_at?:   string
        }
      }
      monthly_payouts: {
        Row: {
          id:                  string
          professor_id:        string
          reference_month:     string        // date "YYYY-MM-01"
          essays_count:        number
          lessons_count:       number
          essays_amount:       number
          lessons_amount:      number
          total_amount:        number        // generated column: essays_amount + lessons_amount
          status:              PayoutStatus
          payment_method:      string | null // e.g. 'pix'
          pix_key_snapshot:    string | null // PIX key captured at closing time
          closed_at:           string | null
          paid_at:             string | null
          payment_reference:   string | null
          notes:               string | null
          created_at:          string
          updated_at:          string
        }
        Insert: {
          id?:                 string
          professor_id:        string
          reference_month:     string
          essays_count?:       number
          lessons_count?:      number
          essays_amount?:      number
          lessons_amount?:     number
          // total_amount is generated — do not insert
          status?:             PayoutStatus
          payment_method?:     string | null
          pix_key_snapshot?:   string | null
          closed_at?:          string | null
          paid_at?:            string | null
          payment_reference?:  string | null
          notes?:              string | null
          created_at?:         string
          updated_at?:         string
        }
        Update: {
          essays_count?:       number
          lessons_count?:      number
          essays_amount?:      number
          lessons_amount?:     number
          status?:             PayoutStatus
          payment_method?:     string | null
          pix_key_snapshot?:   string | null
          closed_at?:          string | null
          paid_at?:            string | null
          payment_reference?:  string | null
          notes?:              string | null
          updated_at?:         string
        }
      }
      professor_payout_profiles: {
        Row: {
          id:            string
          professor_id:  string
          pix_key:       string | null
          pix_key_type:  PixKeyType | null
          cpf:           string | null
          short_bio:     string | null
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id?:           string
          professor_id:  string
          pix_key?:      string | null
          pix_key_type?: PixKeyType | null
          cpf?:          string | null
          short_bio?:    string | null
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          pix_key?:      string | null
          pix_key_type?: PixKeyType | null
          cpf?:          string | null
          short_bio?:    string | null
          updated_at?:   string
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

export type ProfessorRateRow         = Database['public']['Tables']['professor_rates']['Row']
export type LessonSessionRow         = Database['public']['Tables']['lesson_sessions']['Row']
export type MonthlyPayoutRow         = Database['public']['Tables']['monthly_payouts']['Row']
export type ProfessorPayoutProfileRow = Database['public']['Tables']['professor_payout_profiles']['Row']

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
