
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vxliszlmphhaqfuyshnm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bGlzemxtcGhoYXFmdXlzaG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDQyMjYsImV4cCI6MjA1ODkyMDIyNn0.zkeM6fvhRmUK5JbnVTm1Df1ph3co0nKT1-5jKnFdLc4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'salon-booking-app',
    },
  },
});
