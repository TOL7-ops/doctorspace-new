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
      doctors: {
        Row: {
          id: string
          full_name: string
          specialization: string
          qualification: string
          years_of_experience: number
          available_days: string[]
          available_hours: string[]
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          specialization: string
          qualification: string
          years_of_experience: number
          available_days: string[]
          available_hours: string[]
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          specialization?: string
          qualification?: string
          years_of_experience?: number
          available_days?: string[]
          available_hours?: string[]
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          full_name: string
          phone_number: string
          date_of_birth: string
          medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number: string
          date_of_birth: string
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string
          date_of_birth?: string
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_type_id: string
          date: string
          start_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_type_id: string
          date: string
          start_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_type_id?: string
          date?: string
          start_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_types: {
        Row: {
          id: string
          name: string
          duration: number
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          duration: number
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          duration?: number
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          template_id: string | null
          notification_type: string | null
          priority: string | null
          metadata: Json | null
          expires_at: string | null
          action_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          template_id?: string | null
          notification_type?: string | null
          priority?: string | null
          metadata?: Json | null
          expires_at?: string | null
          action_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          template_id?: string | null
          notification_type?: string | null
          priority?: string | null
          metadata?: Json | null
          expires_at?: string | null
          action_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notification_templates: {
        Row: {
          id: string
          name: string
          title_template: string
          message_template: string
          notification_type: string | null
          priority: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title_template: string
          message_template: string
          notification_type?: string | null
          priority?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title_template?: string
          message_template?: string
          notification_type?: string | null
          priority?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          sender_name: string
          content: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          sender_name: string
          content: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          sender_name?: string
          content?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointment_ratings: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          doctor_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          doctor_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_id?: string
          doctor_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_cancellations: {
        Row: {
          id: string
          appointment_id: string
          cancelled_by: string
          reason: string
          cancelled_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          cancelled_by: string
          reason: string
          cancelled_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          cancelled_by?: string
          reason?: string
          cancelled_at?: string
        }
      }
      appointment_reschedules: {
        Row: {
          id: string
          appointment_id: string
          rescheduled_by: string
          old_date: string
          old_start_time: string
          new_date: string
          new_start_time: string
          reason: string | null
          rescheduled_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          rescheduled_by: string
          old_date: string
          old_start_time: string
          new_date: string
          new_start_time: string
          reason?: string | null
          rescheduled_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          rescheduled_by?: string
          old_date?: string
          old_start_time?: string
          new_date?: string
          new_start_time?: string
          reason?: string | null
          rescheduled_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_cancel_appointment: {
        Args: { appointment_uuid: string }
        Returns: boolean
      }
      can_reschedule_appointment: {
        Args: { appointment_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'patient' | 'doctor'
      appointment_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
} 