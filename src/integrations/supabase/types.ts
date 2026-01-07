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
      city_groups: {
        Row: {
          city_key: string
          created_at: string
          id: string
          is_main: boolean
          name: string
        }
        Insert: {
          city_key: string
          created_at?: string
          id?: string
          is_main?: boolean
          name: string
        }
        Update: {
          city_key?: string
          created_at?: string
          id?: string
          is_main?: boolean
          name?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          image_url: string | null
          is_announcement: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          image_url?: string | null
          is_announcement?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          image_url?: string | null
          is_announcement?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "city_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          city: string
          cohort_type: Database["public"]["Enums"]["cohort_type"]
          created_at: string
          forge_end_date: string | null
          forge_start_date: string | null
          id: string
          name: string
        }
        Insert: {
          city: string
          cohort_type?: Database["public"]["Enums"]["cohort_type"]
          created_at?: string
          forge_end_date?: string | null
          forge_start_date?: string | null
          id?: string
          name: string
        }
        Update: {
          city?: string
          cohort_type?: Database["public"]["Enums"]["cohort_type"]
          created_at?: string
          forge_end_date?: string | null
          forge_start_date?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type_id: string | null
          id: string
          image_url: string | null
          is_virtual: boolean
          location: string | null
          notes: string | null
          recording_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type_id?: string | null
          id?: string
          image_url?: string | null
          is_virtual?: boolean
          location?: string | null
          notes?: string | null
          recording_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type_id?: string | null
          id?: string
          image_url?: string | null
          is_virtual?: boolean
          location?: string | null
          notes?: string | null
          recording_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          cta_link: string | null
          cta_text: string | null
          end_at: string | null
          id: string
          image_url: string | null
          pinned: boolean
          priority: number
          start_at: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          pinned?: boolean
          priority?: number
          start_at?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          pinned?: boolean
          priority?: number
          start_at?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      home_cards: {
        Row: {
          card_type: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_pinned: boolean
          link: string | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          card_type: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_pinned?: boolean
          link?: string | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          card_type?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_pinned?: boolean
          link?: string | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ky_dynamic_responses: {
        Row: {
          created_at: string
          form_id: string
          id: string
          responses: Json
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          responses?: Json
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          responses?: Json
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ky_dynamic_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "ky_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      ky_form_fields: {
        Row: {
          created_at: string
          default_value: string | null
          field_key: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          grid_cols: number | null
          helper_text: string | null
          id: string
          is_required: boolean
          label: string
          max_value: number | null
          min_value: number | null
          options: Json | null
          order_index: number
          placeholder: string | null
          step_id: string
          validation_regex: string | null
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          field_key: string
          field_type?: Database["public"]["Enums"]["form_field_type"]
          grid_cols?: number | null
          helper_text?: string | null
          id?: string
          is_required?: boolean
          label: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          step_id: string
          validation_regex?: string | null
        }
        Update: {
          created_at?: string
          default_value?: string | null
          field_key?: string
          field_type?: Database["public"]["Enums"]["form_field_type"]
          grid_cols?: number | null
          helper_text?: string | null
          id?: string
          is_required?: boolean
          label?: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          step_id?: string
          validation_regex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ky_form_fields_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "ky_form_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      ky_form_steps: {
        Row: {
          created_at: string
          description: string | null
          form_id: string
          icon: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_id: string
          icon?: string | null
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          form_id?: string
          icon?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ky_form_steps_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "ky_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      ky_forms: {
        Row: {
          cohort_type: Database["public"]["Enums"]["cohort_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          cohort_type: Database["public"]["Enums"]["cohort_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          cohort_type?: Database["public"]["Enums"]["cohort_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      kyc_responses: {
        Row: {
          age: number | null
          certificate_name: string | null
          chronotype: string | null
          city: string | null
          country: string | null
          created_at: string
          current_status: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          forge_intent: string | null
          forge_intent_other: string | null
          id: string
          instagram_id: string | null
          mbti_type: string | null
          meal_preference: string | null
          primary_platform: string | null
          proficiency_content_creation: string | null
          proficiency_storytelling: string | null
          proficiency_video_production: string | null
          state: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          top_3_creators: string[] | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          age?: number | null
          certificate_name?: string | null
          chronotype?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_status?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          forge_intent?: string | null
          forge_intent_other?: string | null
          id?: string
          instagram_id?: string | null
          mbti_type?: string | null
          meal_preference?: string | null
          primary_platform?: string | null
          proficiency_content_creation?: string | null
          proficiency_storytelling?: string | null
          proficiency_video_production?: string | null
          state?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          top_3_creators?: string[] | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          age?: number | null
          certificate_name?: string | null
          chronotype?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_status?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          forge_intent?: string | null
          forge_intent_other?: string | null
          id?: string
          instagram_id?: string | null
          mbti_type?: string | null
          meal_preference?: string | null
          primary_platform?: string | null
          proficiency_content_creation?: string | null
          proficiency_storytelling?: string | null
          proficiency_video_production?: string | null
          state?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          top_3_creators?: string[] | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      kyf_responses: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          age: number | null
          certificate_name: string | null
          chronotype: string | null
          city: string | null
          created_at: string
          current_occupation: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          food_allergies: string | null
          forge_intent: string | null
          forge_intent_other: string | null
          full_body_url: string | null
          gender: string | null
          has_editing_laptop: boolean | null
          headshot_front_url: string | null
          headshot_left_url: string | null
          headshot_right_url: string | null
          height_ft: string | null
          id: string
          instagram_id: string | null
          languages_known: string[] | null
          mbti_type: string | null
          meal_preference: string | null
          medication_support: string | null
          photo_favorite_url: string | null
          pincode: string | null
          proficiency_cinematography: string | null
          proficiency_direction: string | null
          proficiency_editing: string | null
          proficiency_screenwriting: string | null
          state: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          top_3_movies: string[] | null
          tshirt_size: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          age?: number | null
          certificate_name?: string | null
          chronotype?: string | null
          city?: string | null
          created_at?: string
          current_occupation?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          food_allergies?: string | null
          forge_intent?: string | null
          forge_intent_other?: string | null
          full_body_url?: string | null
          gender?: string | null
          has_editing_laptop?: boolean | null
          headshot_front_url?: string | null
          headshot_left_url?: string | null
          headshot_right_url?: string | null
          height_ft?: string | null
          id?: string
          instagram_id?: string | null
          languages_known?: string[] | null
          mbti_type?: string | null
          meal_preference?: string | null
          medication_support?: string | null
          photo_favorite_url?: string | null
          pincode?: string | null
          proficiency_cinematography?: string | null
          proficiency_direction?: string | null
          proficiency_editing?: string | null
          proficiency_screenwriting?: string | null
          state?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          top_3_movies?: string[] | null
          tshirt_size?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          age?: number | null
          certificate_name?: string | null
          chronotype?: string | null
          city?: string | null
          created_at?: string
          current_occupation?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          food_allergies?: string | null
          forge_intent?: string | null
          forge_intent_other?: string | null
          full_body_url?: string | null
          gender?: string | null
          has_editing_laptop?: boolean | null
          headshot_front_url?: string | null
          headshot_left_url?: string | null
          headshot_right_url?: string | null
          height_ft?: string | null
          id?: string
          instagram_id?: string | null
          languages_known?: string[] | null
          mbti_type?: string | null
          meal_preference?: string | null
          medication_support?: string | null
          photo_favorite_url?: string | null
          pincode?: string | null
          proficiency_cinematography?: string | null
          proficiency_direction?: string | null
          proficiency_editing?: string | null
          proficiency_screenwriting?: string | null
          state?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          top_3_movies?: string[] | null
          tshirt_size?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      kyw_responses: {
        Row: {
          age: number | null
          certificate_name: string | null
          chronotype: string | null
          city: string | null
          created_at: string
          current_occupation: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          forge_intent: string | null
          forge_intent_other: string | null
          id: string
          mbti_type: string | null
          primary_language: string | null
          proficiency_story_voice: string | null
          proficiency_writing: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          top_3_writers_books: string[] | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
          writing_types: string[] | null
        }
        Insert: {
          age?: number | null
          certificate_name?: string | null
          chronotype?: string | null
          city?: string | null
          created_at?: string
          current_occupation?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          forge_intent?: string | null
          forge_intent_other?: string | null
          id?: string
          mbti_type?: string | null
          primary_language?: string | null
          proficiency_story_voice?: string | null
          proficiency_writing?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          top_3_writers_books?: string[] | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
          writing_types?: string[] | null
        }
        Update: {
          age?: number | null
          certificate_name?: string | null
          chronotype?: string | null
          city?: string | null
          created_at?: string
          current_occupation?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          forge_intent?: string | null
          forge_intent_other?: string | null
          id?: string
          mbti_type?: string | null
          primary_language?: string | null
          proficiency_story_voice?: string | null
          proficiency_writing?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          top_3_writers_books?: string[] | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
          writing_types?: string[] | null
        }
        Relationships: []
      }
      learn_content: {
        Row: {
          access_token: string | null
          bonuses: Json | null
          category: string
          company_name: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          full_description: string | null
          id: string
          instructor_name: string | null
          is_premium: boolean
          order_index: number
          program_id: string | null
          section_type: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_source_type: string | null
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          access_token?: string | null
          bonuses?: Json | null
          category: string
          company_name?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          full_description?: string | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean
          order_index?: number
          program_id?: string | null
          section_type?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_source_type?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          access_token?: string | null
          bonuses?: Json | null
          category?: string
          company_name?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          full_description?: string | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean
          order_index?: number
          program_id?: string | null
          section_type?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_source_type?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learn_content_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learn_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      learn_programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          instructor_avatar: string | null
          instructor_bio: string | null
          instructor_name: string | null
          is_active: boolean
          name: string
          order_index: number
          slug: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_bio?: string | null
          instructor_name?: string | null
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_bio?: string | null
          instructor_name?: string | null
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      learn_resources: {
        Row: {
          created_at: string
          description: string | null
          file_size_mb: number | null
          file_type: string
          file_url: string
          id: string
          is_premium: boolean
          learn_content_id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size_mb?: number | null
          file_type?: string
          file_url: string
          id?: string
          is_premium?: boolean
          learn_content_id: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size_mb?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_premium?: boolean
          learn_content_id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learn_resources_learn_content_id_fkey"
            columns: ["learn_content_id"]
            isOneToOne: false
            referencedRelation: "learn_content"
            referencedColumns: ["id"]
          },
        ]
      }
      learn_watch_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_watched_at: string
          learn_content_id: string
          progress_seconds: number
          total_seconds: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_watched_at?: string
          learn_content_id: string
          progress_seconds?: number
          total_seconds?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_watched_at?: string
          learn_content_id?: string
          progress_seconds?: number
          total_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learn_watch_progress_learn_content_id_fkey"
            columns: ["learn_content_id"]
            isOneToOne: false
            referencedRelation: "learn_content"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          auto_update: boolean
          body: string | null
          created_at: string
          created_by: string | null
          deep_link: string | null
          expiry_at: string | null
          id: string
          is_global: boolean
          is_read: boolean
          link: string | null
          message: string
          pinned: boolean
          priority: number
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          auto_update?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          deep_link?: string | null
          expiry_at?: string | null
          id?: string
          is_global?: boolean
          is_read?: boolean
          link?: string | null
          message: string
          pinned?: boolean
          priority?: number
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          auto_update?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          deep_link?: string | null
          expiry_at?: string | null
          id?: string
          is_global?: boolean
          is_read?: boolean
          link?: string | null
          message?: string
          pinned?: boolean
          priority?: number
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_checklist: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          task_key: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          task_key: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          task_key?: string
          user_id?: string
        }
        Relationships: []
      }
      past_programs: {
        Row: {
          completion_date: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          program_type: string
          recording_url: string | null
        }
        Insert: {
          completion_date: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          program_type?: string
          recording_url?: string | null
        }
        Update: {
          completion_date?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          program_type?: string
          recording_url?: string | null
        }
        Relationships: []
      }
      perks: {
        Row: {
          claim_instructions: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          partner_logo_url: string | null
          partner_name: string | null
          title: string
        }
        Insert: {
          claim_instructions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          partner_logo_url?: string | null
          partner_name?: string | null
          title: string
        }
        Update: {
          claim_instructions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          partner_logo_url?: string | null
          partner_name?: string | null
          title?: string
        }
        Relationships: []
      }
      prep_checklist_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          due_days_before: number | null
          edition_id: string | null
          id: string
          is_required: boolean
          order_index: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          due_days_before?: number | null
          edition_id?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          due_days_before?: number | null
          edition_id?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_checklist_items_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          edition_id: string | null
          email: string | null
          forge_mode: Database["public"]["Enums"]["forge_mode"]
          full_name: string | null
          id: string
          instagram_handle: string | null
          ky_form_completed: boolean
          kyf_completed: boolean
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          profile_setup_completed: boolean
          specialty: string | null
          twitter_handle: string | null
          unlock_level: Database["public"]["Enums"]["unlock_level"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          edition_id?: string | null
          email?: string | null
          forge_mode?: Database["public"]["Enums"]["forge_mode"]
          full_name?: string | null
          id: string
          instagram_handle?: string | null
          ky_form_completed?: boolean
          kyf_completed?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          profile_setup_completed?: boolean
          specialty?: string | null
          twitter_handle?: string | null
          unlock_level?: Database["public"]["Enums"]["unlock_level"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          edition_id?: string | null
          email?: string | null
          forge_mode?: Database["public"]["Enums"]["forge_mode"]
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          ky_form_completed?: boolean
          kyf_completed?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          profile_setup_completed?: boolean
          specialty?: string | null
          twitter_handle?: string | null
          unlock_level?: Database["public"]["Enums"]["unlock_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_days: {
        Row: {
          activity_type: string | null
          call_time: string | null
          checklist: Json | null
          created_at: string
          date: string | null
          day_number: number
          description: string | null
          duration_hours: number | null
          edition_id: string | null
          id: string
          intensity_level: string | null
          is_active: boolean
          key_learnings: string[] | null
          location: string | null
          location_image_url: string | null
          mentors: string[] | null
          milestone_type: string | null
          objective: string | null
          reveal_days_before: number | null
          schedule: Json | null
          teaser_text: string | null
          theme_name: string | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          call_time?: string | null
          checklist?: Json | null
          created_at?: string
          date?: string | null
          day_number: number
          description?: string | null
          duration_hours?: number | null
          edition_id?: string | null
          id?: string
          intensity_level?: string | null
          is_active?: boolean
          key_learnings?: string[] | null
          location?: string | null
          location_image_url?: string | null
          mentors?: string[] | null
          milestone_type?: string | null
          objective?: string | null
          reveal_days_before?: number | null
          schedule?: Json | null
          teaser_text?: string | null
          theme_name?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          call_time?: string | null
          checklist?: Json | null
          created_at?: string
          date?: string | null
          day_number?: number
          description?: string | null
          duration_hours?: number | null
          edition_id?: string | null
          id?: string
          intensity_level?: string | null
          is_active?: boolean
          key_learnings?: string[] | null
          location?: string | null
          location_image_url?: string | null
          mentors?: string[] | null
          milestone_type?: string | null
          objective?: string | null
          reveal_days_before?: number | null
          schedule?: Json | null
          teaser_text?: string | null
          theme_name?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_days_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_galleries: {
        Row: {
          created_at: string
          description: string | null
          edition_id: string | null
          gallery_type: string
          id: string
          image_url: string
          is_featured: boolean
          location_name: string | null
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          edition_id?: string | null
          gallery_type: string
          id?: string
          image_url: string
          is_featured?: boolean
          location_name?: string | null
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          edition_id?: string | null
          gallery_type?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          location_name?: string | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_galleries_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_films: {
        Row: {
          award_tags: Json | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          edition_id: string | null
          id: string
          is_featured: boolean
          order_index: number
          student_name: string
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          award_tags?: Json | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          edition_id?: string | null
          id?: string
          is_featured?: boolean
          order_index?: number
          student_name: string
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          award_tags?: Json | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          edition_id?: string | null
          id?: string
          is_featured?: boolean
          order_index?: number
          student_name?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_films_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_prep_progress: {
        Row: {
          checklist_item_id: string
          completed_at: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          checklist_item_id: string
          completed_at?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          checklist_item_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prep_progress_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "prep_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_access_logs: {
        Row: {
          accessed_at: string
          id: string
          ip_address: string | null
          learn_content_id: string
          user_agent: string | null
          user_id: string
          watch_duration_seconds: number | null
        }
        Insert: {
          accessed_at?: string
          id?: string
          ip_address?: string | null
          learn_content_id: string
          user_agent?: string | null
          user_id: string
          watch_duration_seconds?: number | null
        }
        Update: {
          accessed_at?: string
          id?: string
          ip_address?: string | null
          learn_content_id?: string
          user_agent?: string | null
          user_id?: string
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_access_logs_learn_content_id_fkey"
            columns: ["learn_content_id"]
            isOneToOne: false
            referencedRelation: "learn_content"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      cohort_type: "FORGE" | "FORGE_WRITING" | "FORGE_CREATORS"
      forge_mode: "PRE_FORGE" | "DURING_FORGE" | "POST_FORGE"
      form_field_type:
        | "text"
        | "email"
        | "number"
        | "date"
        | "tel"
        | "textarea"
        | "select"
        | "radio"
        | "checkbox"
        | "multi_select"
        | "proficiency"
        | "photo_upload"
      notification_type: "COMMUNITY" | "LEARN" | "EVENTS" | "ROADMAP" | "SYSTEM"
      payment_status: "CONFIRMED_15K" | "BALANCE_PAID"
      unlock_level: "PREVIEW" | "FULL"
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
      cohort_type: ["FORGE", "FORGE_WRITING", "FORGE_CREATORS"],
      forge_mode: ["PRE_FORGE", "DURING_FORGE", "POST_FORGE"],
      form_field_type: [
        "text",
        "email",
        "number",
        "date",
        "tel",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "multi_select",
        "proficiency",
        "photo_upload",
      ],
      notification_type: ["COMMUNITY", "LEARN", "EVENTS", "ROADMAP", "SYSTEM"],
      payment_status: ["CONFIRMED_15K", "BALANCE_PAID"],
      unlock_level: ["PREVIEW", "FULL"],
    },
  },
} as const
