
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CreateReminder from "./pages/CreateReminder";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import { ReminderProvider } from "./context/ReminderContext";
import { AuthProvider } from "./context/auth";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/AuthCallback";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ReminderProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-reminder" element={<CreateReminder />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ReminderProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
