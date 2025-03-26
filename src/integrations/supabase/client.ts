
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mqjxuadsgxdejmoyigyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xanh1YWRzZ3hkZWptb3lpZ3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDY0MTYsImV4cCI6MjA1ODA4MjQxNn0._AE-82fTX1EXxlClatmjoJiWs7jHmnII-rRSk1PYMbE";

// Log Supabase connection details for debugging
console.log("Initializing Supabase client with:", { 
  url: SUPABASE_URL,
  keyLength: SUPABASE_PUBLISHABLE_KEY.length,
  keyPrefix: SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...'
});

// Create Supabase client with proper configuration for auth
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage
    },
    global: {
      headers: {
        'X-Client-Info': 'teacherreminder-app'
      },
    },
    // Add retries to improve connection reliability
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Function to check if Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Checking Supabase connection...");
    const startTime = Date.now();
    const { error, data } = await supabase.from('reminders').select('id').limit(1);
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error("Supabase connection check failed:", error, "Response time:", duration, "ms");
      return false;
    }
    
    console.log("Supabase connection successful!", "Response time:", duration, "ms", "Data:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection check exception:", error);
    return false;
  }
};

// Initialize connection check on load
setTimeout(() => {
  checkSupabaseConnection()
    .then(isConnected => {
      console.log("Initial Supabase connection check:", isConnected ? "Connected" : "Failed");
    })
    .catch(err => {
      console.error("Error during initial connection check:", err);
    });
}, 1000); // Wait 1 second after load
