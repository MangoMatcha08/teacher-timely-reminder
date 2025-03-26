
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthScreen from "@/components/auth/AuthScreen";
import Button from "@/components/shared/Button";
import { toast } from "sonner";

const Auth = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Wrap the auth hook in a try-catch to handle potential context errors
  let authState = {
    isAuthenticated: false,
    isInitialized: false,
    hasCompletedOnboarding: false,
    resetOnboarding: () => {}
  };
  
  try {
    authState = useAuth();
  } catch (error) {
    console.error("Error accessing auth context:", error);
    setAuthError("There was a problem connecting to the authentication service. Please try refreshing the page.");
  }
  
  const { isAuthenticated, isInitialized, hasCompletedOnboarding, resetOnboarding } = authState;
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      if (hasCompletedOnboarding) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding, navigate]);
  
  const handleResetOnboarding = () => {
    try {
      resetOnboarding();
      toast.success("Onboarding reset successfully!");
      navigate("/onboarding");
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
      toast.error("Failed to reset onboarding. Please try again.");
    }
  };
  
  // Show auth error if there was a problem with the context
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Authentication Error</h2>
          <p className="mb-6 text-center text-muted-foreground">{authError}</p>
          <Button variant="primary" onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  if (!isInitialized) {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-teacher-blue border-t-transparent animate-spin mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Already Signed In</h2>
          <p className="mb-6 text-center text-muted-foreground">
            You're already logged in. Where would you like to go?
          </p>
          <div className="space-y-3">
            <Button variant="primary" onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleResetOnboarding} className="w-full">
              Reset Onboarding
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return <AuthScreen />;
};

export default Auth;
