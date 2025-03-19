
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthScreen from "@/components/auth/AuthScreen";

const Auth = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
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
  
  return <AuthScreen />;
};

export default Auth;
