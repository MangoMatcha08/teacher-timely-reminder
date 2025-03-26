import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Verify React is available in this file
console.log("Index.tsx - React check:", {
  isReactAvailable: !!React,
  useState: !!React.useState,
  useEffect: !!React.useEffect
});

const Index = () => {
  // Handle errors safely in case context fails
  const [authState, setAuthState] = React.useState({
    isAuthenticated: false,
    isInitialized: false,
    hasCompletedOnboarding: false
  });
  const [isContextError, setIsContextError] = React.useState(false);
  const navigate = useNavigate();

  // Safely get auth state
  React.useEffect(() => {
    try {
      const auth = useAuth();
      setAuthState({
        isAuthenticated: auth.isAuthenticated,
        isInitialized: auth.isInitialized,
        hasCompletedOnboarding: auth.hasCompletedOnboarding
      });
    } catch (error) {
      console.error("Error accessing auth context:", error);
      setIsContextError(true);
      setAuthState(prev => ({...prev, isInitialized: true})); // Prevent infinite loading
    }
  }, []);

  // Handle navigation based on auth state
  React.useEffect(() => {
    if (!isContextError && authState.isInitialized && authState.isAuthenticated) {
      try {
        if (authState.hasCompletedOnboarding) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("Navigation error:", error);
        toast.error("Something went wrong while navigating. Please try refreshing the page.");
      }
    }
  }, [authState, isContextError, navigate]);

  // Context error state
  if (isContextError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-amber-600">Application Notice</h2>
          <p className="mb-6 text-center text-muted-foreground">
            There was a problem initializing the application. Please try refreshing the page.
          </p>
          <Button 
            className="w-full py-6 text-lg" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Loading state while initializing auth
  if (!authState.isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading your experience...</h2>
        </div>
      </div>
    );
  }

  // Main index content for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Reminder App</h1>
          <p className="text-gray-600">Organize your school day efficiently</p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full py-6 text-lg" 
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mt-6">
              Streamline your teaching schedule with customized reminders for class periods, meetings, and important tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
