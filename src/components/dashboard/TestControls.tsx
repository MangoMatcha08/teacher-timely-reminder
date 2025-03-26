
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loadTestDataToFirebase, verifyFirebaseConnection } from "@/services/firebaseTestData";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/context/ReminderContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const TestControls: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();
  const { fetchReminders } = useReminders();
  
  const handleTestConnection = async () => {
    setLoading(true);
    setTestStatus("Testing Firebase connection...");
    
    try {
      const isConnected = await verifyFirebaseConnection();
      if (isConnected) {
        setTestStatus("Firebase connection successful! ✅");
        toast.success("Firebase connection successful!");
      } else {
        setTestStatus("Firebase connection failed. ❌");
        toast.error("Firebase connection failed");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestStatus("Firebase connection error: " + (error instanceof Error ? error.message : "Unknown error"));
      toast.error("Firebase connection error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadTestData = async () => {
    if (!user) {
      toast.error("You need to be logged in to load test data");
      return;
    }
    
    setShowDialog(true);
  };
  
  const confirmLoadTestData = async () => {
    if (!user) {
      toast.error("You need to be logged in to load test data");
      return;
    }
    
    setLoading(true);
    setTestStatus("Loading test data to Firebase...");
    
    try {
      await loadTestDataToFirebase(user.uid);
      setTestStatus("Test data loaded successfully! ✅");
      toast.success("Test data loaded successfully!");
      
      // Refresh data in the app
      fetchReminders();
    } catch (error) {
      console.error("Error loading test data:", error);
      setTestStatus("Error loading test data: " + (error instanceof Error ? error.message : "Unknown error"));
      toast.error("Error loading test data");
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };
  
  return (
    <>
      <div className="bg-gray-50 p-4 rounded-lg border mt-6">
        <h3 className="text-sm font-medium mb-2">Firebase Testing Tools</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            disabled={loading}
          >
            Test Firebase Connection
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLoadTestData} 
            disabled={loading || !user}
          >
            Load Test Data
          </Button>
        </div>
        
        {testStatus && (
          <div className="mt-2 text-xs text-muted-foreground">
            {testStatus}
          </div>
        )}
        
        {!user && (
          <div className="mt-2 text-xs text-red-500">
            You need to be logged in to use these features
          </div>
        )}
      </div>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Loading Test Data</DialogTitle>
            <DialogDescription>
              This will add sample school setup and reminders to your Firebase account.
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={confirmLoadTestData} disabled={loading}>
              {loading ? "Loading..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestControls;
