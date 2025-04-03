/**
 * Supabase Client
 * 
 * This service provides a client for interacting with Supabase for authentication
 * and database access.
 */

import { createClient } from '@supabase/supabase-js';
import { logError } from './errorLogging';

// Supabase configuration from environment variables
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

/**
 * Sign up a new user
 * @param email - User's email
 * @param password - User's password
 * @param metadata - Additional user metadata
 * @returns The user data and session
 */
export const signUp = async (
  email: string,
  password: string,
  metadata: { name: string; [key: string]: any } = { name: '' }
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to sign up');
    logError(errorObj, { email, metadata });
    throw errorObj;
  }
};

/**
 * Sign in a user
 * @param email - User's email
 * @param password - User's password
 * @returns The user data and session
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to sign in');
    logError(errorObj, { email });
    throw errorObj;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to sign out');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get the current user
 * @returns The current user data
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to get current user');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get the current session
 * @returns The current session data
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to get session');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Reset password
 * @param email - User's email
 * @returns Success status
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to reset password');
    logError(errorObj, { email });
    throw errorObj;
  }
};

/**
 * Update user profile
 * @param profile - User profile data to update
 * @returns Updated user data
 */
export const updateProfile = async (profile: { [key: string]: any }) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: profile,
    });

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to update profile');
    logError(errorObj, { profile });
    throw errorObj;
  }
};

export default supabase;