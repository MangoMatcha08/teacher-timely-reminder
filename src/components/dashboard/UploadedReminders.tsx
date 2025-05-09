
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const UploadedReminders: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const fetchReminders = async () => {
    if (!user) {
      setLoading(false);
      setReminders([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch reminders directly from Supabase to show what's in the backend
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Reminders fetched directly from Supabase:", data);
      setReminders(data || []);
    } catch (err: any) {
      console.error("Error fetching uploaded reminders:", err);
      setError(err.message || "Failed to load reminders from Supabase");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReminders();
  }, [user]);
  
  const handleRefresh = () => {
    fetchReminders();
    toast.info("Refreshing reminders from Supabase...");
  };
  
  if (loading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Uploaded Reminders (Loading...)</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mt-4 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-red-600">Error Loading Reminders</CardTitle>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-red-500 gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-4">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Reminders in Supabase ({reminders.length})</CardTitle>
        <button 
          onClick={handleRefresh}
          className="p-1 rounded-full hover:bg-gray-100"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            No reminders found in Supabase. Try loading test data.
          </p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="text-xs p-2 border rounded-md">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{reminder.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {reminder.completed ? "Completed" : "Active"}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {reminder.category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {reminder.category}
                    </Badge>
                  )}
                  {reminder.priority && (
                    <Badge variant="secondary" className="text-[10px]">
                      {reminder.priority}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-muted-foreground">
                  ID: {reminder.id.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadedReminders;
