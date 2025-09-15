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
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          avatar_url: string | null
          marketing_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          type: 'billing' | 'shipping'
          is_default: boolean
          full_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state_province: string
          postal_code: string
          country: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'billing' | 'shipping'
          is_default?: boolean
          full_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          state_province: string
          postal_code: string
          country?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'billing' | 'shipping'
          is_default?: boolean
          full_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state_province?: string
          postal_code?: string
          country?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name_key: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name_key: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_key?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          short_description: string | null
          slug: string
          sku: string | null
          price: number
          compare_at_price: number | null
          cost_price: number | null
          weight: number | null
          dimensions: Json | null
          requires_shipping: boolean
          is_digital: boolean
          track_inventory: boolean
          inventory_quantity: number
          inventory_policy: 'deny' | 'continue'
          tags: string[] | null
          images: string[] | null
          seo_title: string | null
          seo_description: string | null
          is_active: boolean
          featured: boolean
          rating: number
          reviews_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          short_description?: string | null
          slug: string
          sku?: string | null
          price: number
          compare_at_price?: number | null
          cost_price?: number | null
          weight?: number | null
          dimensions?: Json | null
          requires_shipping?: boolean
          is_digital?: boolean
          track_inventory?: boolean
          inventory_quantity?: number
          inventory_policy?: 'deny' | 'continue'
          tags?: string[] | null
          images?: string[] | null
          seo_title?: string | null
          seo_description?: string | null
          is_active?: boolean
          featured?: boolean
          rating?: number
          reviews_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          short_description?: string | null
          slug?: string
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          weight?: number | null
          dimensions?: Json | null
          requires_shipping?: boolean
          is_digital?: boolean
          track_inventory?: boolean
          inventory_quantity?: number
          inventory_policy?: 'deny' | 'continue'
          tags?: string[] | null
          images?: string[] | null
          seo_title?: string | null
          seo_description?: string | null
          is_active?: boolean
          featured?: boolean
          rating?: number
          reviews_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          product_id: string
          category_id: string
        }
        Insert: {
          product_id: string
          category_id: string
        }
        Update: {
          product_id?: string
          category_id?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          title: string
          sku: string | null
          price: number | null
          compare_at_price: number | null
          cost_price: number | null
          inventory_quantity: number
          weight: number | null
          option1: string | null
          option2: string | null
          option3: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          title: string
          sku?: string | null
          price?: number | null
          compare_at_price?: number | null
          cost_price?: number | null
          inventory_quantity?: number
          weight?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
          sku?: string | null
          price?: number | null
          compare_at_price?: number | null
          cost_price?: number | null
          inventory_quantity?: number
          weight?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id: string
          variant_id?: string | null
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          email: string
          phone: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled'
          payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided'
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          billing_address: Json
          shipping_address: Json
          shipping_method: string | null
          tracking_number: string | null
          tracking_url: string | null
          notes: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          email: string
          phone?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled'
          payment_status?: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided'
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          billing_address: Json
          shipping_address: Json
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          notes?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          email?: string
          phone?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled'
          payment_status?: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided'
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          billing_address?: Json
          shipping_address?: Json
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          notes?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          product_name: string
          variant_title: string | null
          sku: string | null
          price: number
          quantity: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          product_name: string
          variant_title?: string | null
          sku?: string | null
          price: number
          quantity: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          product_name?: string
          variant_title?: string | null
          sku?: string | null
          price?: number
          quantity?: number
          total?: number
          created_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      discount_codes: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value: number
          minimum_amount: number
          usage_limit: number | null
          used_count: number
          starts_at: string
          ends_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value: number
          minimum_amount?: number
          usage_limit?: number | null
          used_count?: number
          starts_at?: string
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed_amount' | 'free_shipping'
          value?: number
          minimum_amount?: number
          usage_limit?: number | null
          used_count?: number
          starts_at?: string
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          role: 'super_admin' | 'admin' | 'moderator'
          permissions: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}