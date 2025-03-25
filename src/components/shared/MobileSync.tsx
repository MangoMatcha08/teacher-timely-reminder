
import React, { useState, useEffect } from 'react';
import { useReminder } from '@/context/ReminderContext';
import { useAuth } from '@/context/auth';
import Button from './Button';
import { Check, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { isPreviewEnvironment } from '@/services/utils/serviceUtils';

const MobileSync: React.FC = () => {
  const { isOnline, syncWithCloud } = useReminder();
  const { isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [forceOnline, setForceOnline] = useState(false);
  
  // Force online mode in preview environment
  useEffect(() => {
    // Always set forceOnline to true for preview environments
    if (isPreviewEnvironment()) {
      setForceOnline(true);
    }
  }, []);
  
  const handleSync = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to sync data');
      return;
    }
    
    // Allow syncing in preview environment even if we're technically offline
    const effectivelyOnline = isOnline || forceOnline;
    
    if (!effectivelyOnline) {
      toast.error('You are currently offline. Please connect to the internet to sync data.');
      return;
    }
    
    try {
      setIsSyncing(true);
      
      // In preview environment, simulate successful sync
      if (forceOnline && !isOnline) {
        // Simulate a delay for realistic feedback
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Data synced successfully (Preview Mode)');
      } else {
        await syncWithCloud();
        toast.success('Data synced successfully');
      }
    } catch (error) {
      toast.error('Failed to sync data. Please try again later.');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline || forceOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      <span className="text-muted-foreground">
        {isOnline || forceOnline ? 'Online' : 'Offline'}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing || (!isOnline && !forceOnline) || !isAuthenticated}
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
