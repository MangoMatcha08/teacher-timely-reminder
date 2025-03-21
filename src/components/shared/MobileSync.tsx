
import React, { useState } from 'react';
import { useReminders } from '@/context/ReminderContext';
import { useAuth } from '@/context/AuthContext';
import Button from './Button';
import { Check, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MobileSync: React.FC = () => {
  const { isOnline, syncWithCloud } = useReminders();
  const { isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  
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
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      <span className="text-muted-foreground">
        {isOnline ? 'Online' : 'Offline'}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing || !isOnline || !isAuthenticated}
        className="ml-2"
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-1" />
        )}
        Sync
      </Button>
    </div>
  );
};

export default MobileSync;
