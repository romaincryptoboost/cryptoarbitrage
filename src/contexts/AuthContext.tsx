import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  firstName?: string;
  lastName?: string;
  theme: 'dark' | 'light';
  passwordChanged: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  createAdmin: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          role: data.role,
          status: data.status,
          firstName: data.first_name,
          lastName: data.last_name,
          theme: data.theme,
          passwordChanged: data.password_changed
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user);
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred during sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
            role: 'CLIENT',
            status: 'ACTIVE',
            theme: 'dark',
            password_changed: true
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: 'Failed to create user profile' };
        }

        await fetchUserProfile(data.user);
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred during sign up' };
    } finally {
      setIsLoading(false);
    }
  };

  const createAdmin = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ error?: string }> => {
    try {
      // Only allow existing admins to create new admins
      if (!user || user.role !== 'ADMIN') {
        return { error: 'Unauthorized: Only admins can create admin accounts' };
      }

      // Use Supabase Admin API to create user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create admin profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
            role: 'ADMIN',
            status: 'ACTIVE',
            theme: 'dark',
            password_changed: false
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
          return { error: 'Failed to create admin profile' };
        }
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred while creating admin' };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          theme: updates.theme
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}