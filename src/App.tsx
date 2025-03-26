
import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import Index from './pages/Index'
import { ReminderProvider } from './context/ReminderContext'
import { AuthProvider } from './context/AuthContext'
import CreateReminder from './pages/CreateReminder'
import { Toaster } from '@/components/ui/sonner'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import { ThemeProvider } from 'next-themes'

// Separate the Routes component to isolate potential errors
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/create-reminder" element={<CreateReminder />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Safer App component without nested context providers
function App() {
  // Define error state directly in the main component
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string } | null>(null);

  // Use a simple effect to set up global error handling
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      // Don't crash for Firebase-related errors
      if (event.reason?.message?.includes("Firebase") || 
          event.reason?.message?.includes("auth") ||
          event.reason?.message?.includes("firestore")) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Render a simple error UI if React itself has issues
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-amber-600">Application Notice</h2>
          <p className="mt-2 text-gray-600">
            {errorInfo?.message || "The application encountered an error. Please refresh the page."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Main rendering path with simplified provider nesting
  return (
    <div className="min-h-screen w-full">
      <BrowserRouter>
        <AuthProvider>
          <ReminderProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <AppRoutes />
              <Toaster />
            </ThemeProvider>
          </ReminderProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
