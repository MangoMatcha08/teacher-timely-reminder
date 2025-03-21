
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthScreen from "@/components/auth/AuthScreen";
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Auth = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding, resetOnboarding, isOffline } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // Add a small delay to ensure all state is properly updated
      setTimeout(() => {
        if (hasCompletedOnboarding) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }, 100);
    }
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding, navigate]);
  
  const handleResetOnboarding = () => {
    resetOnboarding();
    toast.success("Onboarding reset successfully!");
    navigate("/onboarding");
  };
  
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

  if (isOffline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Network Error</h2>
          <div className="mb-6">
            <p className="text-center text-muted-foreground mb-4">
              Unable to connect to the authentication service.
            </p>
            <p className="text-center text-muted-foreground mb-4">
              Please check your internet connection and try again.
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Return to Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                toast.success("Using demo mode with test account");
                navigate("/auth");
              }} 
              className="w-full"
            >
              Continue in Offline Mode
            </Button>
          </div>
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
