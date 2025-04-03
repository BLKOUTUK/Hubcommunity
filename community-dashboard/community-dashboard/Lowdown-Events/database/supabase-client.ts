import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper functions for events
export const eventsApi = {
  // Get all events with optional filtering
  getEvents: async ({
    category,
    startDate,
    endDate,
    location,
    locationType,
    isBlkoutEvent,
    approvalStatus,
    source,
    limit = 10,
    page = 1,
    upcoming = true,
    featured = false,
  }: {
    category?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    locationType?: 'online' | 'in-person' | 'hybrid';
    isBlkoutEvent?: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    source?: string;
    limit?: number;
    page?: number;
    upcoming?: boolean;
    featured?: boolean;
  } = {}) => {
    let query = supabase
      .from('events')
      .select('*, event_categories(*)');

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    if (location) {
      query = query.ilike('location_name', `%${location}%`);
    }

    if (locationType) {
      if (locationType === 'online') {
        query = query.eq('is_online', true);
      } else if (locationType === 'in-person') {
        query = query.eq('is_online', false);
      }
      // For hybrid, we don't need additional filtering
    }

    if (isBlkoutEvent !== undefined) {
      query = query.eq('is_blkout_event', isBlkoutEvent);
    }

    if (approvalStatus) {
      query = query.eq('approval_status', approvalStatus);
    } else {
      // By default, only show approved events
      query = query.eq('approval_status', 'approved');
    }

    if (source) {
      query = query.eq('source_id', source);
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('start_date', today);
    }

    if (featured) {
      query = query.eq('is_blkout_event', true).eq('is_featured', true);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return query
      .order('start_date', { ascending: true })
      .range(from, to);
  },

  // Get a single event by ID
  getEvent: async (id: string) => {
    return supabase
      .from('events')
      .select('*, event_categories(*)')
      .eq('id', id)
      .single();
  },

  // Create a new event
  createEvent: async (eventData: any) => {
    return supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
  },

  // Update an existing event
  updateEvent: async (id: string, eventData: any) => {
    return supabase
      .from('events')
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
  },

  // Delete an event
  deleteEvent: async (id: string) => {
    return supabase
      .from('events')
      .delete()
      .eq('id', id);
  },

  // Approve a pending event
  approveEvent: async (id: string) => {
    return supabase
      .from('events')
      .update({
        approval_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
  },

  // Reject a pending event
  rejectEvent: async (id: string) => {
    return supabase
      .from('events')
      .update({
        approval_status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
  },
};