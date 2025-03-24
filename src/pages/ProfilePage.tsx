
import React from 'react';
import Layout from '@/components/shared/Layout';
import TeacherProfile from '@/components/profile/TeacherProfile';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Layout pageTitle="Profile">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view and edit your profile.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Profile">
      <TeacherProfile />
    </Layout>
  );
};

export default ProfilePage;
