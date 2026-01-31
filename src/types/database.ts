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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'operator' | 'worker' | 'viewer'
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'admin' | 'operator' | 'worker' | 'viewer'
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'operator' | 'worker' | 'viewer'
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      mills: {
        Row: {
          id: string
          code: string
          name: string
          type: string
          feed_source: string | null
          separator_count: number
          default_hourly_rate: number | null
          sends_to_coating: boolean
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          type: string
          feed_source?: string | null
          separator_count?: number
          default_hourly_rate?: number | null
          sends_to_coating?: boolean
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          type?: string
          feed_source?: string | null
          separator_count?: number
          default_hourly_rate?: number | null
          sends_to_coating?: boolean
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      separators: {
        Row: {
          id: string
          mill_id: string
          number: number
          name: string | null
          default_product: string | null
          default_micron: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mill_id: string
          number: number
          name?: string | null
          default_product?: string | null
          default_micron?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mill_id?: string
          number?: number
          name?: string | null
          default_product?: string | null
          default_micron?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "separators_mill_id_fkey"
            columns: ["mill_id"]
            referencedRelation: "mills"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          code: string
          name: string
          micron: number | null
          variant: string | null
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          micron?: number | null
          variant?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          micron?: number | null
          variant?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      silos: {
        Row: {
          id: string
          code: string
          name: string
          type: 'mill_product' | 'coating_raw' | 'coating_product'
          capacity_meters: number | null
          capacity_tons: number | null
          current_level_percent: number
          current_level_tons: number
          mill_id: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          type: 'mill_product' | 'coating_raw' | 'coating_product'
          capacity_meters?: number | null
          capacity_tons?: number | null
          current_level_percent?: number
          current_level_tons?: number
          mill_id?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          type?: 'mill_product' | 'coating_raw' | 'coating_product'
          capacity_meters?: number | null
          capacity_tons?: number | null
          current_level_percent?: number
          current_level_tons?: number
          mill_id?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "silos_mill_id_fkey"
            columns: ["mill_id"]
            referencedRelation: "mills"
            referencedColumns: ["id"]
          }
        ]
      }
      production_sessions: {
        Row: {
          id: string
          mill_id: string
          product_id: string
          target_silo_id: string
          hourly_rate_tons: number
          started_at: string
          ended_at: string | null
          status: 'active' | 'paused' | 'completed' | 'cancelled'
          notes: string | null
          created_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          mill_id: string
          product_id: string
          target_silo_id: string
          hourly_rate_tons: number
          started_at?: string
          ended_at?: string | null
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          notes?: string | null
          created_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          mill_id?: string
          product_id?: string
          target_silo_id?: string
          hourly_rate_tons?: number
          started_at?: string
          ended_at?: string | null
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          notes?: string | null
          created_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_sessions_mill_id_fkey"
            columns: ["mill_id"]
            referencedRelation: "mills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_sessions_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_sessions_target_silo_id_fkey"
            columns: ["target_silo_id"]
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_sessions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      packaging_entries: {
        Row: {
          id: string
          silo_id: string
          product_id: string
          worker_id: string
          package_type: 'BB' | 'PP' | 'KRAFT'
          quantity_tons: number
          quantity_bags: number | null
          shift: string | null
          recorded_at: string
          created_by: string
          notes: string | null
        }
        Insert: {
          id?: string
          silo_id: string
          product_id: string
          worker_id: string
          package_type: 'BB' | 'PP' | 'KRAFT'
          quantity_tons: number
          quantity_bags?: number | null
          shift?: string | null
          recorded_at?: string
          created_by: string
          notes?: string | null
        }
        Update: {
          id?: string
          silo_id?: string
          product_id?: string
          worker_id?: string
          package_type?: 'BB' | 'PP' | 'KRAFT'
          quantity_tons?: number
          quantity_bags?: number | null
          shift?: string | null
          recorded_at?: string
          created_by?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packaging_entries_silo_id_fkey"
            columns: ["silo_id"]
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaging_entries_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaging_entries_worker_id_fkey"
            columns: ["worker_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaging_entries_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      silo_level_logs: {
        Row: {
          id: string
          silo_id: string
          level_percent: number
          level_tons: number | null
          source: string
          production_session_id: string | null
          recorded_by: string | null
          recorded_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          silo_id: string
          level_percent: number
          level_tons?: number | null
          source: string
          production_session_id?: string | null
          recorded_by?: string | null
          recorded_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          silo_id?: string
          level_percent?: number
          level_tons?: number | null
          source?: string
          production_session_id?: string | null
          recorded_by?: string | null
          recorded_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "silo_level_logs_silo_id_fkey"
            columns: ["silo_id"]
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "silo_level_logs_production_session_id_fkey"
            columns: ["production_session_id"]
            referencedRelation: "production_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "silo_level_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      silo_product_rules: {
        Row: {
          id: string
          silo_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          silo_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          silo_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "silo_product_rules_silo_id_fkey"
            columns: ["silo_id"]
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "silo_product_rules_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      flow_nodes: {
        Row: {
          id: string
          entity_id: string
          entity_type: 'mill' | 'silo' | 'coating' | 'output'
          position_x: number
          position_y: number
          ui_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          entity_type: 'mill' | 'silo' | 'coating' | 'output'
          position_x?: number
          position_y?: number
          ui_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          entity_type?: 'mill' | 'silo' | 'coating' | 'output'
          position_x?: number
          position_y?: number
          ui_data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      flow_connections: {
        Row: {
          id: string
          source_id: string
          source_type: 'mill' | 'silo' | 'coating' | 'output'
          source_handle: string | null
          target_id: string
          target_type: 'mill' | 'silo' | 'coating' | 'output'
          target_handle: string | null
          connection_rules: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          source_id: string
          source_type: 'mill' | 'silo' | 'coating' | 'output'
          source_handle?: string | null
          target_id: string
          target_type: 'mill' | 'silo' | 'coating' | 'output'
          target_handle?: string | null
          connection_rules?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          source_id?: string
          source_type?: 'mill' | 'silo' | 'coating' | 'output'
          source_handle?: string | null
          target_id?: string
          target_type?: 'mill' | 'silo' | 'coating' | 'output'
          target_handle?: string | null
          connection_rules?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_connections_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'operator' | 'worker' | 'viewer'
      silo_type: 'mill_product' | 'coating_raw' | 'coating_product'
      package_type: 'BB' | 'PP' | 'KRAFT'
      production_status: 'active' | 'paused' | 'completed' | 'cancelled'
      entity_type: 'mill' | 'silo' | 'coating' | 'output'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
