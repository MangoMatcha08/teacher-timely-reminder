
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardComponent from "@/components/dashboard/Dashboard";
import Layout from "@/components/shared/Layout";
import QuickCreateReminder from "@/components/reminders/QuickCreateReminder";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (!hasCompletedOnboarding) {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding, navigate]);
  
  if (!isInitialized || !isAuthenticated) {
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
  
  return (
    <Layout>
      <DashboardComponent />
      
      {/* Quick create floating button (mobile only) */}
      <button
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teacher-blue text-white shadow-lg flex items-center justify-center"
        onClick={() => setShowQuickCreate(true)}
      >
        <Plus className="w-6 h-6" />
      </button>
      
      {showQuickCreate && (
        <QuickCreateReminder onClose={() => setShowQuickCreate(false)} />
      )}
    </Layout>
  );
};

export default Dashboard;
