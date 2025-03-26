
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          navigate('/auth');
          return;
        }

        toast.success("Authentication successful!");
        
        // Wait briefly to ensure auth state is fully updated
        setTimeout(() => {
          if (hasCompletedOnboarding) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }, 500);
      } catch (error) {
        console.error("Error in auth callback:", error);
        toast.error("Something went wrong. Please try again.");
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, hasCompletedOnboarding]);

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (isAuthenticated) {
      if (hasCompletedOnboarding) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Completing authentication...</h2>
        <p className="text-sm text-gray-500 mt-2">You'll be redirected shortly</p>
      </div>
    </div>
  );
};

export default AuthCallback;
