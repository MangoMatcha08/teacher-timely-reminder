
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        if (hasCompletedOnboarding) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    }
  }, [isInitialized, isAuthenticated, hasCompletedOnboarding, navigate]);

  // Loading state while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading your experience...</h2>
        </div>
      </div>
    );
  }

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
