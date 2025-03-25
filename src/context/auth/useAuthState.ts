
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleNetworkError, isPreviewEnvironment } from "@/services/utils/serviceUtils";
import { manageTestUserOnboarding, createTestUser } from "./utils";
import { handleTestAccountLogin } from "./authUtils";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null);
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null);

  // Initialize the authentication state
  useEffect(() => {
    if (authSubscription) {
      return () => {
        if (authSubscription) {
          authSubscription.unsubscribe();
        }
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
      };
    }

    const initializeAuth = async () => {
      try {
        // For preview environment, use a shorter timeout and just create a test user immediately
        if (isPreviewEnvironment()) {
          console.log("Preview environment detected - creating test user immediately");
          handleTestAccountLogin().then((testUser) => {
            setUser(testUser);
            setSession({ 
              access_token: `fake-token-${Date.now()}`,
              token_type: 'bearer',
              user: testUser,
              expires_at: Date.now() + 3600,
              expires_in: 3600,
              refresh_token: `fake-refresh-${Date.now()}`
            } as Session);
            setHasCompletedOnboarding(true);
            setIsInitialized(true);
            setIsOffline(false);
          });
          return;
        }
        
        const timeoutDuration = 5000;
        
        const timeout = setTimeout(() => {
          console.log("Auth initialization timed out - switching to offline mode");
          setIsOffline(true);
          setIsInitialized(true);
          toast.error("Connection timeout. Using offline mode.");
        }, timeoutDuration);
        
        setInitTimeout(timeout);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              const userHasCompletedOnboarding = manageTestUserOnboarding(session.user.id);
              setHasCompletedOnboarding(userHasCompletedOnboarding);
            }
          }
        );
        
        setAuthSubscription(subscription);

        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (initTimeout) {
            clearTimeout(initTimeout);
            setInitTimeout(null);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userHasCompletedOnboarding = manageTestUserOnboarding(session.user.id);
            setHasCompletedOnboarding(userHasCompletedOnboarding);
          }
          
          setIsOffline(false);
        } catch (error: any) {
          console.error("Error getting session:", error);
          const isNetworkError = handleNetworkError(error, 'retrieving authentication session');
          setIsOffline(isNetworkError);
        } finally {
          if (initTimeout) {
            clearTimeout(initTimeout);
            setInitTimeout(null);
          }
          
          setIsInitialized(true);
        }
      } catch (error: any) {
        console.error("Error setting up auth state listener:", error);
        const isNetworkError = handleNetworkError(error, 'initializing authentication');
        setIsOffline(isNetworkError);
        setIsInitialized(true);
        
        if (initTimeout) {
          clearTimeout(initTimeout);
          setInitTimeout(null);
        }
      }
    };

    initializeAuth();
    
    // Set up listeners for network status changes
    return setupNetworkListeners(setIsOffline);
  }, []);

  return {
    user,
    setUser,
    session,
    setSession,
    isInitialized,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    isOffline,
    setIsOffline
  };
};

// Set up network status change listeners
const setupNetworkListeners = (setIsOffline: React.Dispatch<React.SetStateAction<boolean>>) => {
  const handleConnectionChange = () => {
    const isOnline = navigator.onLine;
    console.log("Network status changed:", isOnline ? "online" : "offline");
    
    if (isPreviewEnvironment()) {
      setIsOffline(false);
      return;
    }
    
    if (!isOnline) {
      setIsOffline(true);
      toast.error("Network disconnected. Using offline mode.");
    } else {
      setIsOffline(false);
    }
  };
  
  window.addEventListener('online', handleConnectionChange);
  window.addEventListener('offline', handleConnectionChange);
  
  if (!navigator.onLine && !isPreviewEnvironment()) {
    console.log("Initial network status: offline");
    setIsOffline(true);
  } else {
    setIsOffline(false);
  }
  
  return () => {
    window.removeEventListener('online', handleConnectionChange);
    window.removeEventListener('offline', handleConnectionChange);
  };
};
