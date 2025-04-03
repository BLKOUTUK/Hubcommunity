import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    updateProfile: async () => {}
  });

  const { toast } = useToast();

  const transformSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || 'Anonymous User',
      email: supabaseUser.email || '',
      role: supabaseUser.user_metadata?.role || 'user',
      points: 0,
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: supabaseUser.created_at,
      updatedAt: new Date().toISOString()
    };
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        user: transformSupabaseUser(session?.user ?? null),
        isAuthenticated: !!session,
        isLoading: false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setAuthState(prev => ({
          ...prev,
          user: transformSupabaseUser(session?.user ?? null),
          isAuthenticated: !!session,
          isLoading: false
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You have been logged in successfully.'
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to login',
        isLoading: false
      }));
      toast({
        title: 'Error',
        description: 'Failed to login. Please check your credentials.',
        variant: 'destructive'
      });
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You have been logged out successfully.'
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to logout',
        isLoading: false
      }));
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.email, // In a real app, you'd have a separate password field
        options: {
          data: {
            full_name: userData.name,
            role: userData.role,
            avatar_url: userData.avatar
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your account has been created successfully.'
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to register',
        isLoading: false
      }));
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No user logged in');
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          role: userData.role,
          avatar_url: userData.avatar
        }
      });

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user!,
          ...userData,
          updatedAt: new Date().toISOString()
        },
        isLoading: false
      }));

      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.'
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to update profile',
        isLoading: false
      }));
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
