
import React, { useState } from 'react';
import { useReminders } from '@/context/ReminderContext';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

const MobileSync: React.FC = () => {
  const { isOnline, syncWithCloud, syncStatus } = useReminders();
  const { isAuthenticated, user, offlineMode } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  
  const handleSync = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to sync data');
      return;
    }
    
    if (!isOnline) {
      toast.error('You are currently offline. Please connect to the internet to sync data.');
      return;
    }
    
    try {
      setIsSyncing(true);
      await syncWithCloud();
      toast.success('Data synced successfully');
    } catch (error) {
      toast.error('Failed to sync data. Please try again later.');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  const checkConnection = async () => {
    setIsCheckingConnection(true);
    toast.info('Checking connection to Supabase...');
    
    try {
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        toast.success('Successfully connected to Supabase!');
      } else {
        toast.error('Could not connect to Supabase. Please check your network connection.');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      toast.error('Error checking connection to Supabase.');
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        
        {offlineMode && (
          <div className="flex items-center ml-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-amber-500 text-xs">Offline mode</span>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing || !isOnline || !isAuthenticated}
          className="ml-auto"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Sync
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {user ? `Logged in: ${user.email}` : 'Not logged in'}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          disabled={isCheckingConnection}
          className="text-xs h-7 px-2"
        >
          {isCheckingConnection ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <span>Check Connection</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileSync;
