
import * as React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import Index from './pages/Index'
import { ReminderProvider } from './context/reminder/ReminderContext'
import { AuthProvider } from './context/auth'
import CreateReminder from './pages/CreateReminder'
import { Toaster } from '@/components/ui/sonner'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import { ThemeProvider } from 'next-themes'

// Verify React is available
console.log("App.tsx - React check:", { 
  isReactAvailable: !!React,
  useState: !!React.useState,
  useEffect: !!React.useEffect
});

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

// Error Boundary component to catch React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-amber-600">Application Notice</h2>
            <p className="mt-2 text-gray-600">
              {this.state.errorMessage || "The application encountered an error. Please refresh the page."}
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
    return this.props.children;
  }
}

// Firebase error handler for global errors
const FirebaseErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
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

  return <>{children}</>;
};

// Wrapper component to ensure React hooks work
const ReactHookTester: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testState, setTestState] = React.useState(false);
  
  React.useEffect(() => {
    console.log("ReactHookTester - React hooks are working");
    setTestState(true);
  }, []);
  
  if (!testState) {
    console.log("ReactHookTester - Waiting for hooks confirmation");
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-teacher-blue border-t-transparent animate-spin mb-4" />
          <p className="text-muted-foreground">Verifying application components...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Main App component with optimized context nesting
function App() {
  return (
    <div className="min-h-screen w-full">
      <ErrorBoundary>
        <ReactHookTester>
          <FirebaseErrorHandler>
            <BrowserRouter>
              <AuthProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                  <ReminderProvider>
                    <AppRoutes />
                    <Toaster />
                  </ReminderProvider>
                </ThemeProvider>
              </AuthProvider>
            </BrowserRouter>
          </FirebaseErrorHandler>
        </ReactHookTester>
      </ErrorBoundary>
    </div>
  );
}

export default App;
