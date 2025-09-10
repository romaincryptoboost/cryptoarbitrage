import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'CLIENT' | 'ADMIN'
          status: 'ACTIVE' | 'SUSPENDED'
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
          theme: 'dark' | 'light'
          password_changed: boolean
        }
        Insert: {
          id?: string
          email: string
          role?: 'CLIENT' | 'ADMIN'
          status?: 'ACTIVE' | 'SUSPENDED'
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
          theme?: 'dark' | 'light'
          password_changed?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: 'CLIENT' | 'ADMIN'
          status?: 'ACTIVE' | 'SUSPENDED'
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
          theme?: 'dark' | 'light'
          password_changed?: boolean
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string | null
          asset: 'BTC' | 'ETH' | 'USDT' | 'USDC'
          balance: number
          address: string | null
          is_master: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          asset: 'BTC' | 'ETH' | 'USDT' | 'USDC'
          balance?: number
          address?: string | null
          is_master?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          asset?: 'BTC' | 'ETH' | 'USDT' | 'USDC'
          balance?: number
          address?: string | null
          is_master?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVEST'
          asset: 'BTC' | 'ETH' | 'USDT' | 'USDC'
          amount: number
          status: 'PENDING' | 'COMPLETED' | 'REJECTED'
          from_asset: string | null
          to_asset: string | null
          exchange_rate: number | null
          plan_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVEST'
          asset: 'BTC' | 'ETH' | 'USDT' | 'USDC'
          amount: number
          status?: 'PENDING' | 'COMPLETED' | 'REJECTED'
          from_asset?: string | null
          to_asset?: string | null
          exchange_rate?: number | null
          plan_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVEST'
          asset?: 'BTC' | 'ETH' | 'USDT' | 'USDC'
          amount?: number
          status?: 'PENDING' | 'COMPLETED' | 'REJECTED'
          from_asset?: string | null
          to_asset?: string | null
          exchange_rate?: number | null
          plan_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          duration_days: number
          apy: number
          min_amount: number
          max_amount: number | null
          is_active: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          duration_days: number
          apy: number
          min_amount: number
          max_amount?: number | null
          is_active?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          duration_days?: number
          apy?: number
          min_amount?: number
          max_amount?: number | null
          is_active?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          amount: number
          start_date: string
          end_date: string
          status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          total_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          amount: number
          start_date?: string
          end_date: string
          status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          total_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          amount?: number
          start_date?: string
          end_date?: string
          status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          total_earned?: number
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
          type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
          is_read?: boolean
          created_at?: string
        }
      }
      rates_cache: {
        Row: {
          id: string
          symbol: string
          price_usd: number
          change_24h: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          price_usd: number
          change_24h: number
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          price_usd?: number
          change_24h?: number
          last_updated?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string
          resource_id: string | null
          details: Record<string, any> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource: string
          resource_id?: string | null
          details?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          details?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);