
import React from 'react';
import { User, Session } from "@supabase/supabase-js";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { getSchoolSetup } from "@/services/supabase/schoolSetup";
import { toast } from "sonner";

/**
 * Custom hook to manage authentication state
 */
export function useAuthState() {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(false);
  const [connectionChecks, setConnectionChecks] = React.useState(0);
  
  // Auth state listener
  React.useEffect(() => {
    console.log("Setting up Supabase auth state listener");
    let isSubscribed = true;
    
    // First, set up the auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, sessionData) => {
      if (!isSubscribed) return;
      
      console.log("Auth state changed:", { 
        event, 
        userId: sessionData?.user?.id || "no user",
        time: new Date().toISOString()
      });
      
      setUser(sessionData?.user || null);
      setSession(sessionData);
      setIsInitialized(true);
      
      // Check onboarding status if user exists
      if (sessionData?.user) {
        setTimeout(() => {
          if (isSubscribed) {
            checkOnboardingStatus(sessionData.user.id);
          }
        }, 0);
      }
    });
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
      if (!isSubscribed) return;
      
      console.log("Initial session check:", { 
        userId: sessionData?.user?.id || "no session",
        time: new Date().toISOString()
      });
      
      setUser(sessionData?.user || null);
      setSession(sessionData);
      setIsInitialized(true);
      
      // Check onboarding status if user exists
      if (sessionData?.user) {
        setTimeout(() => {
          if (isSubscribed) {
            checkOnboardingStatus(sessionData.user.id);
          }
        }, 0);
      }
    }).catch(error => {
      if (!isSubscribed) return;
      
      console.error("Error getting session:", error);
      setIsInitialized(true);
      
      // Try to verify connection before going offline
      checkConnectionBeforeOffline();
    });
    
    // Set a timeout to switch to offline mode if Supabase auth doesn't initialize quickly
    const offlineTimer = setTimeout(() => {
      if (!isSubscribed) return;
      
      if (!isInitialized) {
        console.info("Auth initialization timed out - checking connection before going offline");
        checkConnectionBeforeOffline();
      }
    }, 12000); // Extended to 12 seconds (from 8)
    
    // Helper function to check connection before going offline
    const checkConnectionBeforeOffline = async () => {
      if (!isSubscribed) return;
      
      setConnectionChecks(prev => prev + 1);
      
      try {
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          console.log("Connection verified, but auth initialization timed out");
          setIsInitialized(true);
          
          // Retry getting session
          const { data } = await supabase.auth.getSession();
          setUser(data.session?.user || null);
          setSession(data.session);
          
          // Only go offline if we still don't have a session
          if (!data.session) {
            console.log("No session after retrying - switching to limited functionality mode");
            setOfflineMode(true);
            toast.warning("Running in limited functionality mode");
          }
        } else {
          console.log("Connection failed - switching to offline mode");
          setIsInitialized(true);
          setOfflineMode(true);
          toast.error("Could not connect to server - running in offline mode");
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        setIsInitialized(true);
        setOfflineMode(true);
        toast.error("Network error - running in offline mode");
      }
    };
    
    // Cleanup subscription and timer on unmount
    return () => {
      isSubscribed = false;
      data.subscription.unsubscribe();
      clearTimeout(offlineTimer);
    };
  }, []);
  
  // Helper function to check onboarding status
  const checkOnboardingStatus = async (userId: string) => {
    try {
      console.log("Checking onboarding status for user:", userId);
      const schoolSetup = await getSchoolSetup(userId);
      setHasCompletedOnboarding(!!schoolSetup);
      console.log("Onboarding status checked:", !!schoolSetup);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(false);
    }
  };

  // Set onboarding status - with correct return type
  const setCompletedOnboarding = (): true => {
    console.log("Setting onboarding as completed");
    setHasCompletedOnboarding(true);
    return true;
  };

  return {
    user,
    session,
    isInitialized,
    hasCompletedOnboarding,
    offlineMode,
    connectionChecks,
    setCompletedOnboarding,
    setHasCompletedOnboarding
  };
}
