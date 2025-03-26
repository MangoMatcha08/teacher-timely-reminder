
import React from 'react';
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
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
  
  // Set a timeout to switch to offline mode if Supabase auth doesn't initialize quickly
  React.useEffect(() => {
    const offlineTimer = setTimeout(() => {
      if (!isInitialized) {
        console.info("Auth initialization timed out - switching to offline mode");
        setIsInitialized(true);
        setOfflineMode(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(offlineTimer);
  }, [isInitialized]);

  // Check for onboarding completion
  React.useEffect(() => {
    if (offlineMode || !user) return;
    
    console.log("Auth context: Checking onboarding status");
    const checkOnboardingStatus = async () => {
      try {
        const schoolSetup = await getSchoolSetup(user.id);
        setHasCompletedOnboarding(!!schoolSetup);
        console.log("Onboarding status checked:", !!schoolSetup);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasCompletedOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user, offlineMode]);
  
  // Auth state listener
  React.useEffect(() => {
    console.log("Setting up Supabase auth state listener");
    let subscription: { subscription: any } | null = null;
    
    try {
      // First, set up the auth state listener
      const { data } = supabase.auth.onAuthStateChange((event, sessionData) => {
        console.log("Auth state changed:", { event, userId: sessionData?.user?.id || "no user" });
        setUser(sessionData?.user || null);
        setSession(sessionData);
        setIsInitialized(true);
      });
      
      subscription = { subscription: data.subscription };
      
      // Then check for existing session
      supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
        console.log("Initial session check:", { userId: sessionData?.user?.id || "no session" });
        setUser(sessionData?.user || null);
        setSession(sessionData);
        setIsInitialized(true);
      });
    } catch (error) {
      console.error("Error in auth state listener:", error);
      setIsInitialized(true);
      setOfflineMode(true);
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

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
    setCompletedOnboarding,
    setHasCompletedOnboarding
  };
}
