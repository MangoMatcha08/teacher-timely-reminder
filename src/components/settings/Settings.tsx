
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useReminders } from '@/context/ReminderContext';
import NotificationSettings from './notifications/NotificationSettings';
import FeedbackForm from './FeedbackForm';

interface SettingsProps {
  onResetOnboarding: () => void;
  onModifySettings: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetOnboarding, onModifySettings }) => {
  const { logout, user } = useAuth();
  const { syncWithCloud, isOnline } = useReminders();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = async () => {
    if (!isOnline) {
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncWithCloud();
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium">Teacher</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                  Edit Profile
                </Button>
                <Button variant="destructive" onClick={logout}>
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>School Settings</CardTitle>
                <CardDescription>
                  Manage your school setup, periods, and schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can update your school settings, periods, and schedule preferences.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={onModifySettings}>
                  Modify School Settings
                </Button>
                <Button variant="outline" onClick={onResetOnboarding}>
                  Reset Onboarding
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your data, including syncing, importing, and exporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Sync to Cloud</h3>
                <p className="text-muted-foreground">
                  Sync your reminders and settings to the cloud for access on other devices.
                </p>
                <Button 
                  onClick={handleSync} 
                  disabled={!isOnline || isSyncing} 
                  className="mt-2"
                >
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-muted-foreground">
                  Export your reminders and settings as a JSON file.
                </p>
                <Button variant="outline" className="mt-2">
                  Export Data
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Import Data</h3>
                <p className="text-muted-foreground">
                  Import reminders and settings from a previously exported file.
                </p>
                <Button variant="outline" className="mt-2">
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <FeedbackForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
