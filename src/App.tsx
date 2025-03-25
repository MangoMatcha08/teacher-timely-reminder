
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import { ReminderProvider } from './context/ReminderContext';
import { AuthProvider } from './context/auth';
import CreateReminder from './pages/CreateReminder';
import { Toaster } from '@/components/ui/sonner';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import TemplateLibrary from './pages/TemplateLibrary';
import ProfilePage from './pages/ProfilePage';
import Analytics from './pages/Analytics';

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ReminderProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/create-reminder" element={<CreateReminder />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/templates" element={<TemplateLibrary />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ReminderProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
