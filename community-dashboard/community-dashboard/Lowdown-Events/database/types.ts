export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      event_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_sources: {
        Row: {
          id: string;
          name: string;
          url: string;
          scraping_enabled: boolean;
          scraping_config: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          scraping_enabled?: boolean;
          scraping_config?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string;
          scraping_enabled?: boolean;
          scraping_config?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          start_time: string | null;
          end_time: string | null;
          location_name: string | null;
          location_address: string | null;
          location_city: string | null;
          location_postal_code: string | null;
          is_online: boolean;
          online_url: string | null;
          ticket_url: string | null;
          image_url: string | null;
          organizer_name: string | null;
          organizer_id: string | null;
          is_blkout_event: boolean;
          is_featured: boolean;
          source_id: string | null;
          source_event_id: string | null;
          approval_status: string;
          category_id: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          location_name?: string | null;
          location_address?: string | null;
          location_city?: string | null;
          location_postal_code?: string | null;
          is_online?: boolean;
          online_url?: string | null;
          ticket_url?: string | null;
          image_url?: string | null;
          organizer_name?: string | null;
          organizer_id?: string | null;
          is_blkout_event?: boolean;
          is_featured?: boolean;
          source_id?: string | null;
          source_event_id?: string | null;
          approval_status?: string;
          category_id?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          location_name?: string | null;
          location_address?: string | null;
          location_city?: string | null;
          location_postal_code?: string | null;
          is_online?: boolean;
          online_url?: string | null;
          ticket_url?: string | null;
          image_url?: string | null;
          organizer_name?: string | null;
          organizer_id?: string | null;
          is_blkout_event?: boolean;
          is_featured?: boolean;
          source_id?: string | null;
          source_event_id?: string | null;
          approval_status?: string;
          category_id?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_categories: string[] | null;
          preferred_locations: string[] | null;
          preferred_days: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_categories?: string[] | null;
          preferred_locations?: string[] | null;
          preferred_days?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_categories?: string[] | null;
          preferred_locations?: string[] | null;
          preferred_days?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_scrape_logs: {
        Row: {
          id: string;
          source_id: string;
          scrape_date: string;
          events_found: number;
          events_added: number;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          scrape_date?: string;
          events_found?: number;
          events_added?: number;
          status: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          scrape_date?: string;
          events_found?: number;
          events_added?: number;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Event type for frontend usage
export interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationCity: string | null;
  locationPostalCode: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  ticketUrl: string | null;
  imageUrl: string | null;
  organizerName: string | null;
  isBlkoutEvent: boolean;
  isFeatured: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  category: {
    id: string;
    name: string;
  } | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

// Convert database row to frontend event
export function convertDbEventToEvent(dbEvent: Database['public']['Tables']['events']['Row'] & { event_categories: Database['public']['Tables']['event_categories']['Row'] | null }): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    locationName: dbEvent.location_name,
    locationAddress: dbEvent.location_address,
    locationCity: dbEvent.location_city,
    locationPostalCode: dbEvent.location_postal_code,
    isOnline: dbEvent.is_online,
    onlineUrl: dbEvent.online_url,
    ticketUrl: dbEvent.ticket_url,
    imageUrl: dbEvent.image_url,
    organizerName: dbEvent.organizer_name,
    isBlkoutEvent: dbEvent.is_blkout_event,
    isFeatured: dbEvent.is_featured,
    approvalStatus: dbEvent.approval_status as 'pending' | 'approved' | 'rejected',
    category: dbEvent.event_categories ? {
      id: dbEvent.event_categories.id,
      name: dbEvent.event_categories.name,
    } : null,
    tags: dbEvent.tags,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
  };
}