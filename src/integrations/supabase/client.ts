// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vmitcgaxrrcqfollxiil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaXRjZ2F4cnJjcWZvbGx4aWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDc4MjEsImV4cCI6MjA1Njg4MzgyMX0.KB3MqOWpCQ_QEzwa4mpL0wW8BrQIljpJ65MAxeQJKpQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);