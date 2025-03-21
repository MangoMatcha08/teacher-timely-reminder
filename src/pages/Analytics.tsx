
import React from 'react';
import Layout from '@/components/shared/Layout';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Analytics = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();

  if (!isAuthenticated) {
    return (
      <Layout pageTitle="Analytics">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view your analytics.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Layout pageTitle="Analytics">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-xl font-semibold mb-2">Complete Onboarding First</h2>
          <p className="text-muted-foreground mb-4">Please complete the onboarding process to access analytics.</p>
          <Button onClick={() => window.location.href = '/onboarding'}>
            Go to Onboarding
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Analytics">
      <AnalyticsDashboard />
    </Layout>
  );
};

export default Analytics;
