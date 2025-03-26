
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
    // Add custom fetch with CORS debugging
    fetch: (url, options) => {
      console.log("Supabase fetch request:", { 
        url: url.toString(), 
        method: options?.method || 'GET',
        headers: options?.headers ? Object.keys(options.headers) : []
      });
      
      // Use the standard fetch with additional logging
      return fetch(url, {
        ...options,
        // Add mode: 'cors' explicitly
        mode: 'cors',
      })
      .then(response => {
        console.log("Supabase fetch response:", { 
          status: response.status, 
          statusText: response.statusText,
          headers: Array.from(response.headers.entries()),
          url: response.url
        });
        return response;
      })
      .catch(error => {
        console.error("Supabase fetch error:", { 
          message: error.message, 
          type: error.name,
          stack: error.stack
        });
        throw error;
      });
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

// Add a specific CORS check
export const checkCORSConnection = async (): Promise<{success: boolean, details: any}> => {
  try {
    console.log("Running CORS diagnostic test...");
    const startTime = Date.now();
    
    // Make a simple OPTIONS request to check CORS
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    const duration = Date.now() - startTime;
    const headers = Object.fromEntries([...response.headers.entries()]);
    
    const details = {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
      accessControlAllowOrigin: headers['access-control-allow-origin'] || null,
      accessControlAllowMethods: headers['access-control-allow-methods'] || null,
      accessControlAllowHeaders: headers['access-control-allow-headers'] || null,
      duration: `${duration}ms`
    };
    
    console.log("CORS check result:", details);
    
    return {
      success: response.ok && headers['access-control-allow-origin'] !== undefined,
      details
    };
  } catch (error) {
    console.error("CORS check failed:", error);
    return {
      success: false,
      details: {
        error: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
};

// Initialize connection check on load
setTimeout(() => {
  checkSupabaseConnection()
    .then(isConnected => {
      console.log("Initial Supabase connection check:", isConnected ? "Connected" : "Failed");
      if (!isConnected) {
        // If connection failed, try CORS check
        checkCORSConnection().then(corsResult => {
          console.log("CORS diagnostic results:", corsResult);
        });
      }
    })
    .catch(err => {
      console.error("Error during initial connection check:", err);
    });
}, 1000); // Wait 1 second after load
