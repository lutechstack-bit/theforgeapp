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
      alumni_testimonials: {
        Row: {
          achievement: string | null
          cohort_types: string[] | null
          created_at: string | null
          film: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          role: string | null
          thumbnail_url: string | null
          video_url: string
        }
        Insert: {
          achievement?: string | null
          cohort_types?: string[] | null
          created_at?: string | null
          film?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          role?: string | null
          thumbnail_url?: string | null
          video_url: string
        }
        Update: {
          achievement?: string | null
          cohort_types?: string[] | null
          created_at?: string | null
          film?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          role?: string | null
          thumbnail_url?: string | null
          video_url?: string
        }
        Relationships: []
      }
      announcement_triggers: {
        Row: {
          config: Json | null
          created_at: string | null
          deep_link: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          message_template: string | null
          priority: number | null
          title_template: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          deep_link?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          priority?: number | null
          title_template: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          deep_link?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          priority?: number | null
          title_template?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_changelog: {
        Row: {
          added_by: string | null
          category: string
          created_at: string | null
          date_added: string
          description: string
          id: string
          status: string
          title: string
          version: string
        }
        Insert: {
          added_by?: string | null
          category?: string
          created_at?: string | null
          date_added?: string
          description: string
          id?: string
          status?: string
          title: string
          version: string
        }
        Update: {
          added_by?: string | null
          category?: string
          created_at?: string | null
          date_added?: string
          description?: string
          id?: string
          status?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      app_doc_versions: {
        Row: {
          changelog: string | null
          content_snapshot: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_current: boolean | null
          release_notes: string | null
          title: string
          version: string
        }
        Insert: {
          changelog?: string | null
          content_snapshot?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          release_notes?: string | null
          title: string
          version: string
        }
        Update: {
          changelog?: string | null
          content_snapshot?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          release_notes?: string | null
          title?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_doc_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      cohort_groups: {
        Row: {
          created_at: string | null
          edition_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          edition_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          edition_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_groups_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: true
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_highlights: {
        Row: {
          created_at: string
          description: string | null
          edition_id: string | null
          highlight_date: string
          highlight_type: string
          id: string
          image_url: string | null
          is_pinned: boolean
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          edition_id?: string | null
          highlight_date?: string
          highlight_type?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          edition_id?: string | null
          highlight_date?: string
          highlight_type?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_highlights_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          cohort_group_id: string | null
          content: string
          created_at: string
          group_id: string
          id: string
          image_url: string | null
          is_announcement: boolean
          user_id: string
        }
        Insert: {
          cohort_group_id?: string | null
          content: string
          created_at?: string
          group_id: string
          id?: string
          image_url?: string | null
          is_announcement?: boolean
          user_id: string
        }
        Update: {
          cohort_group_id?: string | null
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
            foreignKeyName: "community_messages_cohort_group_id_fkey"
            columns: ["cohort_group_id"]
            isOneToOne: false
            referencedRelation: "cohort_groups"
            referencedColumns: ["id"]
          },
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
          archived_at: string | null
          city: string
          cohort_type: Database["public"]["Enums"]["cohort_type"]
          created_at: string
          forge_end_date: string | null
          forge_start_date: string | null
          id: string
          is_archived: boolean
          name: string
        }
        Insert: {
          archived_at?: string | null
          city: string
          cohort_type?: Database["public"]["Enums"]["cohort_type"]
          created_at?: string
          forge_end_date?: string | null
          forge_start_date?: string | null
          id?: string
          is_archived?: boolean
          name: string
        }
        Update: {
          archived_at?: string | null
          city?: string
          cohort_type?: Database["public"]["Enums"]["cohort_type"]
          created_at?: string
          forge_end_date?: string | null
          forge_start_date?: string | null
          id?: string
          is_archived?: boolean
          name?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          show_on_homepage: boolean
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
          show_on_homepage?: boolean
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
          show_on_homepage?: boolean
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
      forge_equipment: {
        Row: {
          brand: string
          category: string
          cohort_type: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          model: string | null
          name: string
          order_index: number
          specs: Json | null
        }
        Insert: {
          brand: string
          category: string
          cohort_type?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          model?: string | null
          name: string
          order_index?: number
          specs?: Json | null
        }
        Update: {
          brand?: string
          category?: string
          cohort_type?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          model?: string | null
          name?: string
          order_index?: number
          specs?: Json | null
        }
        Relationships: []
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
      journey_stages: {
        Row: {
          color: string | null
          created_at: string | null
          days_after_start: number | null
          days_before_start: number | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number
          stage_key: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          days_after_start?: number | null
          days_before_start?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          stage_key: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          days_after_start?: number | null
          days_before_start?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          stage_key?: string
          title?: string
        }
        Relationships: []
      }
      journey_tasks: {
        Row: {
          auto_complete_field: string | null
          cohort_types: string[] | null
          created_at: string | null
          deep_link: string | null
          description: string | null
          due_days_offset: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          linked_prep_category: string | null
          order_index: number
          stage_id: string | null
          title: string
        }
        Insert: {
          auto_complete_field?: string | null
          cohort_types?: string[] | null
          created_at?: string | null
          deep_link?: string | null
          description?: string | null
          due_days_offset?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          linked_prep_category?: string | null
          order_index?: number
          stage_id?: string | null
          title: string
        }
        Update: {
          auto_complete_field?: string | null
          cohort_types?: string[] | null
          created_at?: string | null
          deep_link?: string | null
          description?: string | null
          due_days_offset?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          linked_prep_category?: string | null
          order_index?: number
          stage_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
        ]
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
          instructor_avatar_url: string | null
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
          instructor_avatar_url?: string | null
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
          instructor_avatar_url?: string | null
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
      mentors: {
        Row: {
          bio: string[] | null
          brands: Json | null
          cohort_types: string[] | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          modal_image_url: string | null
          name: string
          order_index: number | null
          roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bio?: string[] | null
          brands?: Json | null
          cohort_types?: string[] | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          modal_image_url?: string | null
          name: string
          order_index?: number | null
          roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bio?: string[] | null
          brands?: Json | null
          cohort_types?: string[] | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          modal_image_url?: string | null
          name?: string
          order_index?: number | null
          roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      nightly_ritual_items: {
        Row: {
          category: string
          cohort_type: string
          created_at: string
          day_number: number
          description: string | null
          icon: string | null
          id: string
          is_required: boolean
          order_index: number
          title: string
        }
        Insert: {
          category: string
          cohort_type?: string
          created_at?: string
          day_number: number
          description?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          title: string
        }
        Update: {
          category?: string
          cohort_type?: string
          created_at?: string
          day_number?: number
          description?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          auto_update: boolean
          body: string | null
          created_at: string
          created_by: string | null
          deep_link: string | null
          display_style: string | null
          expiry_at: string | null
          icon_emoji: string | null
          id: string
          is_global: boolean
          is_hero_announcement: boolean | null
          is_read: boolean
          link: string | null
          message: string
          pinned: boolean
          priority: number
          target_stage: string | null
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
          display_style?: string | null
          expiry_at?: string | null
          icon_emoji?: string | null
          id?: string
          is_global?: boolean
          is_hero_announcement?: boolean | null
          is_read?: boolean
          link?: string | null
          message: string
          pinned?: boolean
          priority?: number
          target_stage?: string | null
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
          display_style?: string | null
          expiry_at?: string | null
          icon_emoji?: string | null
          id?: string
          is_global?: boolean
          is_hero_announcement?: boolean | null
          is_read?: boolean
          link?: string | null
          message?: string
          pinned?: boolean
          priority?: number
          target_stage?: string | null
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
          learn_content_id: string | null
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
          learn_content_id?: string | null
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
          learn_content_id?: string | null
          name?: string
          program_type?: string
          recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "past_programs_learn_content_id_fkey"
            columns: ["learn_content_id"]
            isOneToOne: false
            referencedRelation: "learn_content"
            referencedColumns: ["id"]
          },
        ]
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
          cohort_type: string
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
          cohort_type?: string
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
          cohort_type?: string
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
          last_active_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          profile_setup_completed: boolean
          specialty: string | null
          tagline: string | null
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
          last_active_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          profile_setup_completed?: boolean
          specialty?: string | null
          tagline?: string | null
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
          last_active_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          profile_setup_completed?: boolean
          specialty?: string | null
          tagline?: string | null
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
      public_portfolios: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
          expected_outcomes: string[] | null
          gear_materials: string[] | null
          id: string
          intensity_level: string | null
          is_active: boolean
          is_virtual: boolean | null
          key_learnings: string[] | null
          location: string | null
          location_image_url: string | null
          meeting_id: string | null
          meeting_passcode: string | null
          meeting_url: string | null
          mentors: string[] | null
          milestone_type: string | null
          objective: string | null
          pro_tips: string[] | null
          reveal_days_before: number | null
          schedule: Json | null
          session_duration_hours: number | null
          session_start_time: string | null
          teaser_text: string | null
          theme_name: string | null
          title: string
          updated_at: string
          what_youll_learn: string[] | null
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
          expected_outcomes?: string[] | null
          gear_materials?: string[] | null
          id?: string
          intensity_level?: string | null
          is_active?: boolean
          is_virtual?: boolean | null
          key_learnings?: string[] | null
          location?: string | null
          location_image_url?: string | null
          meeting_id?: string | null
          meeting_passcode?: string | null
          meeting_url?: string | null
          mentors?: string[] | null
          milestone_type?: string | null
          objective?: string | null
          pro_tips?: string[] | null
          reveal_days_before?: number | null
          schedule?: Json | null
          session_duration_hours?: number | null
          session_start_time?: string | null
          teaser_text?: string | null
          theme_name?: string | null
          title: string
          updated_at?: string
          what_youll_learn?: string[] | null
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
          expected_outcomes?: string[] | null
          gear_materials?: string[] | null
          id?: string
          intensity_level?: string | null
          is_active?: boolean
          is_virtual?: boolean | null
          key_learnings?: string[] | null
          location?: string | null
          location_image_url?: string | null
          meeting_id?: string | null
          meeting_passcode?: string | null
          meeting_url?: string | null
          mentors?: string[] | null
          milestone_type?: string | null
          objective?: string | null
          pro_tips?: string[] | null
          reveal_days_before?: number | null
          schedule?: Json | null
          session_duration_hours?: number | null
          session_start_time?: string | null
          teaser_text?: string | null
          theme_name?: string | null
          title?: string
          updated_at?: string
          what_youll_learn?: string[] | null
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
      roadmap_sidebar_content: {
        Row: {
          block_type: string
          caption: string | null
          created_at: string | null
          edition_id: string | null
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string
          order_index: number | null
          title: string | null
        }
        Insert: {
          block_type: string
          caption?: string | null
          created_at?: string | null
          edition_id?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url: string
          order_index?: number | null
          title?: string | null
        }
        Update: {
          block_type?: string
          caption?: string | null
          created_at?: string | null
          edition_id?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string
          order_index?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_sidebar_content_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_sidebar_content_editions: {
        Row: {
          content_id: string
          created_at: string | null
          edition_id: string
          id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          edition_id: string
          id?: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          edition_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_sidebar_content_editions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "roadmap_sidebar_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_sidebar_content_editions_edition_id_fkey"
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
      user_journey_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          status: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "journey_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nightly_progress: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          ritual_item_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          ritual_item_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          ritual_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nightly_progress_ritual_item_id_fkey"
            columns: ["ritual_item_id"]
            isOneToOne: false
            referencedRelation: "nightly_ritual_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          content: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_task_preferences: {
        Row: {
          created_at: string
          filter_preference: string | null
          id: string
          stage_id: string
          task_order: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_preference?: string | null
          id?: string
          stage_id: string
          task_order?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_preference?: string | null
          id?: string
          stage_id?: string
          task_order?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_preferences_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_works: {
        Row: {
          award_tags: Json | null
          created_at: string
          description: string | null
          id: string
          media_type: string
          media_url: string | null
          order_index: number
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          award_tags?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          media_type?: string
          media_url?: string | null
          order_index?: number
          thumbnail_url?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          award_tags?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          media_type?: string
          media_url?: string | null
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_works_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
