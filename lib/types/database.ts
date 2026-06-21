export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          role: 'owner' | 'dokter' | 'staff' | 'customer'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          role?: 'owner' | 'dokter' | 'staff' | 'customer'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          role?: 'owner' | 'dokter' | 'staff' | 'customer'
          is_active?: boolean
          created_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          species: string
          breed: string | null
          birth_date: string | null
          gender: string | null
          photo_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          species: string
          breed?: string | null
          birth_date?: string | null
          gender?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          species?: string
          breed?: string | null
          birth_date?: string | null
          gender?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          pet_id: string
          doctor_id: string
          scheduled_at: string
          status: string
          complaint: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          doctor_id: string
          scheduled_at: string
          status?: string
          complaint?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          doctor_id?: string
          scheduled_at?: string
          status?: string
          complaint?: string | null
          created_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          pet_id: string
          doctor_id: string
          appointment_id: string | null
          diagnosis: string
          treatment: string | null
          prescription: string | null
          notes: string | null
          is_visible_customer: boolean
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          doctor_id: string
          appointment_id?: string | null
          diagnosis: string
          treatment?: string | null
          prescription?: string | null
          notes?: string | null
          is_visible_customer?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          doctor_id?: string
          appointment_id?: string | null
          diagnosis?: string
          treatment?: string | null
          prescription?: string | null
          notes?: string | null
          is_visible_customer?: boolean
          created_at?: string
        }
      }
      inpatients: {
        Row: {
          id: string
          pet_id: string
          doctor_id: string
          cage_number: string | null
          admitted_at: string
          discharged_at: string | null
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          pet_id: string
          doctor_id: string
          cage_number?: string | null
          admitted_at?: string
          discharged_at?: string | null
          status?: string
          notes?: string | null
        }
        Update: {
          id?: string
          pet_id?: string
          doctor_id?: string
          cage_number?: string | null
          admitted_at?: string
          discharged_at?: string | null
          status?: string
          notes?: string | null
        }
      }
      inpatient_logs: {
        Row: {
          id: string
          inpatient_id: string
          condition: string
          notes: string | null
          photo_urls: string[] | null
          is_visible_customer: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inpatient_id: string
          condition: string
          notes?: string | null
          photo_urls?: string[] | null
          is_visible_customer?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inpatient_id?: string
          condition?: string
          notes?: string | null
          photo_urls?: string[] | null
          is_visible_customer?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          price: number
          stock: number
          min_stock: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          price: number
          stock?: number
          min_stock?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          price?: number
          stock?: number
          min_stock?: number
          is_active?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          category: string | null
          price: number
          duration_minutes: number | null
          doctor_required: boolean
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          price: number
          duration_minutes?: number | null
          doctor_required?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          price?: number
          duration_minutes?: number | null
          doctor_required?: boolean
          is_active?: boolean
        }
      }
      stock_mutations: {
        Row: {
          id: string
          product_id: string
          type: string
          before_qty: number
          change_qty: number
          after_qty: number
          reference: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          type: string
          before_qty: number
          change_qty: number
          after_qty: number
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: string
          before_qty?: number
          change_qty?: number
          after_qty?: number
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          invoice_no: string
          customer_id: string | null
          cashier_id: string
          total: number
          payment_method: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_no: string
          customer_id?: string | null
          cashier_id: string
          total: number
          payment_method: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_no?: string
          customer_id?: string | null
          cashier_id?: string
          total?: number
          payment_method?: string
          status?: string
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          item_type: string
          item_id: string
          item_name: string
          price: number
          qty: number
          subtotal: number
        }
        Insert: {
          id?: string
          transaction_id: string
          item_type: string
          item_id: string
          item_name: string
          price: number
          qty: number
          subtotal: number
        }
        Update: {
          id?: string
          transaction_id?: string
          item_type?: string
          item_id?: string
          item_name?: string
          price?: number
          qty?: number
          subtotal?: number
        }
      }
      expenses: {
        Row: {
          id: string
          category: string
          amount: number
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          amount: number
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          amount?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      booking_slots: {
        Row: {
          id: string
          doctor_id: string | null
          date: string
          time: string
          is_available: boolean
        }
        Insert: {
          id?: string
          doctor_id?: string | null
          date: string
          time: string
          is_available?: boolean
        }
        Update: {
          id?: string
          doctor_id?: string | null
          date?: string
          time?: string
          is_available?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          slot_id: string
          customer_id: string | null
          owner_name: string
          owner_phone: string
          pet_name: string
          pet_species: string
          complaint: string | null
          status: string
          reject_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slot_id: string
          customer_id?: string | null
          owner_name: string
          owner_phone: string
          pet_name: string
          pet_species: string
          complaint?: string | null
          status?: string
          reject_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slot_id?: string
          customer_id?: string | null
          owner_name?: string
          owner_phone?: string
          pet_name?: string
          pet_species?: string
          complaint?: string | null
          status?: string
          reject_reason?: string | null
          created_at?: string
        }
      }
      clinic_settings: {
        Row: {
          id: number
          clinic_name: string
          address: string | null
          phone: string | null
          open_hours: string | null
          logo_url: string | null
        }
        Insert: {
          id?: number
          clinic_name?: string
          address?: string | null
          phone?: string | null
          open_hours?: string | null
          logo_url?: string | null
        }
        Update: {
          id?: number
          clinic_name?: string
          address?: string | null
          phone?: string | null
          open_hours?: string | null
          logo_url?: string | null
        }
      }
    }
    Functions: {
      my_role: {
        Args: Record<string, never>
        Returns: 'owner' | 'dokter' | 'staff' | 'customer'
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums = {
  user_role: 'owner' | 'dokter' | 'staff' | 'customer'
}