
import React from "react";
import Layout from "@/components/shared/Layout";
import { useNavigate } from "react-router-dom";
import SettingsComponent from "@/components/settings/Settings";

const Settings = () => {
  const navigate = useNavigate();
  
  return (
    <Layout pageTitle="Settings">
      <SettingsComponent />
    </Layout>
  );
};

export default Settings;
