// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yncyvfpittqvwfhmhlrq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY3l2ZnBpdHRxdndmaG1obHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjM5MDUsImV4cCI6MjA1MTk5OTkwNX0.-hCaKSqOgVs4eB3VNMrjHs8t6b6QN1P-E1ZqBMBAIUI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);