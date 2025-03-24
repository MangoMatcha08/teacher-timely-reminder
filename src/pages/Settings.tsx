
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import SettingsComponent from "@/components/settings/Settings";
import Layout from "@/components/shared/Layout";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, hasCompletedOnboarding, resetOnboarding } = useAuth();
  
  // Handlers to be passed to the SettingsComponent
  const handleResetOnboarding = () => {
    resetOnboarding();
    navigate("/auth"); // Force the user to log in again to see the onboarding
  };
  
  const handleModifySettings = () => {
    navigate("/onboarding");
  };
  
  return (
    <Layout pageTitle="Settings">
      <SettingsComponent 
        onResetOnboarding={handleResetOnboarding}
        onModifySettings={handleModifySettings}
      />
    </Layout>
  );
};

export default Settings;
