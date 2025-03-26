
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

function AppContent() {
  // This component handles the Routes
  return (
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </ReminderProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function App() {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string } | null>(null);
  
  // Component-level error boundary using try/catch
  try {
    return (
      // Add enableSystem and disableTransitionOnChange to prevent flashing
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="min-h-screen w-full">
          {hasError ? (
            <div className="min-h-screen flex items-center justify-center bg-white">
              <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
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
          ) : (
            <AppContent />
          )}
        </div>
      </ThemeProvider>
    )
  } catch (error) {
    console.error("Critical application error:", error);
    setHasError(true);
    setErrorInfo(error instanceof Error ? { message: error.message } : { message: "Unknown error" });
    
    // Return a minimal error UI that doesn't depend on any providers
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-gray-600">The application encountered an error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }
}

export default App
