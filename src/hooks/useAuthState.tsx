
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
  
  // Auth state listener
  React.useEffect(() => {
    console.log("Setting up Supabase auth state listener");
    
    // First, set up the auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, sessionData) => {
      console.log("Auth state changed:", { event, userId: sessionData?.user?.id || "no user" });
      setUser(sessionData?.user || null);
      setSession(sessionData);
      setIsInitialized(true);
      
      // Check onboarding status if user exists
      if (sessionData?.user) {
        setTimeout(() => {
          checkOnboardingStatus(sessionData.user.id);
        }, 0);
      }
    });
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
      console.log("Initial session check:", { userId: sessionData?.user?.id || "no session" });
      setUser(sessionData?.user || null);
      setSession(sessionData);
      setIsInitialized(true);
      
      // Check onboarding status if user exists
      if (sessionData?.user) {
        setTimeout(() => {
          checkOnboardingStatus(sessionData.user.id);
        }, 0);
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsInitialized(true);
      setOfflineMode(true);
    });
    
    // Set a timeout to switch to offline mode if Supabase auth doesn't initialize quickly
    const offlineTimer = setTimeout(() => {
      if (!isInitialized) {
        console.info("Auth initialization timed out - switching to offline mode");
        setIsInitialized(true);
        setOfflineMode(true);
      }
    }, 8000); // 8 second timeout
    
    // Cleanup subscription and timer on unmount
    return () => {
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
    setCompletedOnboarding,
    setHasCompletedOnboarding
  };
}
