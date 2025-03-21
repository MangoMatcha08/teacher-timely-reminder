
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CreateReminderComponent from "@/components/reminders/CreateReminder";
import Layout from "@/components/shared/Layout";
import { toast } from "sonner";

const CreateReminder = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated && !isOfflineMode) {
        navigate("/auth");
        toast.error("Please sign in to create reminders");
      } else if (!hasCompletedOnboarding) {
        navigate("/onboarding");
        toast.info("Please complete onboarding first");
      }
    }
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding, isOfflineMode, navigate]);
  
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
  
  // We'll allow creating reminders in offline mode too
  if (!isAuthenticated && !isOfflineMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="p-6 bg-red-50 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m12-8a8 8 0 01-8 8 8 8 0 110-16 8 8 0 018 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to create and manage reminders.</p>
          <button 
            className="px-4 py-2 bg-teacher-blue text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/auth")}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <Layout pageTitle="Create Reminder">
      <CreateReminderComponent />
    </Layout>
  );
};

export default CreateReminder;
