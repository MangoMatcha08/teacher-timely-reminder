
import { toast } from 'sonner';

// Type definition for Supabase tables JSON conversions
export type Json = 
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Helper function to handle network errors
export const handleNetworkError = (error: any, operation: string) => {
  console.error(`Network error during ${operation}:`, error);
  
  // Check if it's a network error
  if (
    (error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('Network Error') ||
      error.message.includes('network request failed')
    )) || 
    (!navigator.onLine) ||
    (error.status === 0) ||  // Status 0 often indicates network error
    (error.__isAuthError && error.status === 0) // Supabase auth error with status 0
  ) {
    // Show user-friendly error message
    if (operation !== 'checking network') { // Don't show toast for network status checks
      toast.error(`Network error: Can't connect to server`, {
        description: "Using offline mode. This could be due to network issues or a firewall blocking connections.",
      });
    }
    return true; // Indicate this is a network error
  }
  return false; // Not a network error
};

// Helper function to check if we're online and can reach Supabase
export const checkNetworkConnection = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    // Try to ping Supabase
    const response = await fetch('https://mqjxuadsgxdejmoyigyj.supabase.co/ping', { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      referrerPolicy: 'no-referrer',
      // Quick timeout to fail fast
      signal: AbortSignal.timeout(3000)
    });
    
    return response.ok;
  } catch (error) {
    handleNetworkError(error, 'checking network');
    return false;
  }
};

// Helper to create a network status listener
export const createNetworkStatusListener = (
  onOnline: () => void, 
  onOffline: () => void
) => {
  const handleOnline = () => onOnline();
  const handleOffline = () => onOffline();
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
