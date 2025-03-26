
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loadTestDataToSupabase, verifySupabaseConnection } from "@/services/supabaseTestData";
import { useAuth } from "@/context/auth";
import { useReminders } from "@/context/ReminderContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import UploadedReminders from "./UploadedReminders";

const TestControls: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();
  const { fetchReminders } = useReminders();
  
  const handleTestConnection = async () => {
    setLoading(true);
    setTestStatus("Testing Supabase connection...");
    
    try {
      const isConnected = await verifySupabaseConnection();
      if (isConnected) {
        setTestStatus("Supabase connection successful! ✅");
        toast.success("Supabase connection successful!");
      } else {
        setTestStatus("Supabase connection failed. ❌");
        toast.error("Supabase connection failed");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestStatus("Supabase connection error: " + (error instanceof Error ? error.message : "Unknown error"));
      toast.error("Supabase connection error");
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
    setTestStatus("Loading test data to Supabase...");
    
    try {
      await loadTestDataToSupabase(user.uid);
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
        <h3 className="text-sm font-medium mb-2">Supabase Testing Tools</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            disabled={loading}
          >
            Test Supabase Connection
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
      
      {/* Add the UploadedReminders component here */}
      <UploadedReminders />
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Loading Test Data</DialogTitle>
            <DialogDescription>
              This will add sample school setup and reminders to your Supabase account.
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
