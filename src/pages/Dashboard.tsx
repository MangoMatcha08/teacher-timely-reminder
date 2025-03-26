
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import DashboardComponent from "@/components/dashboard/Dashboard";
import Layout from "@/components/shared/Layout";

const Dashboard = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();
  
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
    </Layout>
  );
};

export default Dashboard;
