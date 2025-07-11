export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          name: string
          role: string
          department: string | null
          phone: string | null
          notification_preferences: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          name: string
          role?: string
          department?: string | null
          phone?: string | null
          notification_preferences?: any
          is_active?: boolean
        }
        Update: {
          email?: string
          name?: string
          role?: string
          department?: string | null
          phone?: string | null
          notification_preferences?: any
          is_active?: boolean
          updated_at?: string
        }
      }
      carriers: {
        Row: {
          id: number
          name: string
          code: string
          website: string | null
          api_endpoint: string | null
          api_credentials: any | null
          tracking_url_template: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          code: string
          website?: string | null
          api_endpoint?: string | null
          api_credentials?: any | null
          tracking_url_template?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          code?: string
          website?: string | null
          api_endpoint?: string | null
          api_credentials?: any | null
          tracking_url_template?: string | null
          is_active?: boolean
        }
      }
      ports: {
        Row: {
          id: number
          name: string
          code: string
          country: string
          city: string
          latitude: number | null
          longitude: number | null
          timezone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          code: string
          country: string
          city: string
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          code?: string
          country?: string
          city?: string
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          is_active?: boolean
        }
      }
      suppliers: {
        Row: {
          id: number
          name: string
          code: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          is_active?: boolean
        }
      }
      vessels: {
        Row: {
          id: number
          name: string
          imo_number: string | null
          mmsi: string | null
          carrier_id: number | null
          vessel_type: string | null
          flag_country: string | null
          current_latitude: number | null
          current_longitude: number | null
          current_speed: number | null
          current_heading: number | null
          last_position_update: string | null
          created_at: string
        }
        Insert: {
          name: string
          imo_number?: string | null
          mmsi?: string | null
          carrier_id?: number | null
          vessel_type?: string | null
          flag_country?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_speed?: number | null
          current_heading?: number | null
          last_position_update?: string | null
        }
        Update: {
          name?: string
          imo_number?: string | null
          mmsi?: string | null
          carrier_id?: number | null
          vessel_type?: string | null
          flag_country?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_speed?: number | null
          current_heading?: number | null
          last_position_update?: string | null
        }
      }
      shipments: {
        Row: {
          id: number
          bl_number: string
          container_number: string
          carrier_id: number | null
          supplier_id: number | null
          vessel_id: number | null
          origin_port_id: number | null
          destination_port_id: number | null
          etd_original: string | null
          etd_actual: string | null
          eta_original: string | null
          eta_current: string | null
          ata: string | null
          status: string
          priority: string | null
          cargo_description: string | null
          container_type: string | null
          container_size: string | null
          weight_kg: number | null
          value_usd: number | null
          last_tracking_update: string | null
          tracking_status: string | null
          current_location: string | null
          tags: any | null
          notes: string | null
          is_active: boolean
          created_by: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          bl_number: string
          container_number: string
          carrier_id?: number | null
          supplier_id?: number | null
          vessel_id?: number | null
          origin_port_id?: number | null
          destination_port_id?: number | null
          etd_original?: string | null
          etd_actual?: string | null
          eta_original?: string | null
          eta_current?: string | null
          ata?: string | null
          status?: string
          priority?: string | null
          cargo_description?: string | null
          container_type?: string | null
          container_size?: string | null
          weight_kg?: number | null
          value_usd?: number | null
          last_tracking_update?: string | null
          tracking_status?: string | null
          current_location?: string | null
          tags?: any | null
          notes?: string | null
          is_active?: boolean
          created_by?: number | null
        }
        Update: {
          bl_number?: string
          container_number?: string
          carrier_id?: number | null
          supplier_id?: number | null
          vessel_id?: number | null
          origin_port_id?: number | null
          destination_port_id?: number | null
          etd_original?: string | null
          etd_actual?: string | null
          eta_original?: string | null
          eta_current?: string | null
          ata?: string | null
          status?: string
          priority?: string | null
          cargo_description?: string | null
          container_type?: string | null
          container_size?: string | null
          weight_kg?: number | null
          value_usd?: number | null
          last_tracking_update?: string | null
          tracking_status?: string | null
          current_location?: string | null
          tags?: any | null
          notes?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: number
          shipment_id: number | null
          alert_type: string
          severity: string
          title: string
          message: string
          is_read: boolean
          is_resolved: boolean
          assigned_to: number | null
          resolved_by: number | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          shipment_id?: number | null
          alert_type: string
          severity: string
          title: string
          message: string
          is_read?: boolean
          is_resolved?: boolean
          assigned_to?: number | null
          resolved_by?: number | null
          resolved_at?: string | null
        }
        Update: {
          shipment_id?: number | null
          alert_type?: string
          severity?: string
          title?: string
          message?: string
          is_read?: boolean
          is_resolved?: boolean
          assigned_to?: number | null
          resolved_by?: number | null
          resolved_at?: string | null
        }
      }
    }
  }
}
