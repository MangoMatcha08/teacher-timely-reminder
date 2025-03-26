
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { checkCORSConnection, checkSupabaseConnection } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CORSDiagnostic: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  
  const runCORSCheck = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      toast.info("Running CORS and network diagnostics...");
      
      // First check Supabase connection
      const isConnected = await checkSupabaseConnection();
      
      // Then run CORS check
      const corsResult = await checkCORSConnection();
      
      // Combine results
      const diagnosticResults = {
        timestamp: new Date().toISOString(),
        connectionCheck: isConnected,
        corsCheck: corsResult,
        userAgent: navigator.userAgent,
        location: window.location.href,
        onLine: navigator.onLine
      };
      
      setResults(diagnosticResults);
      
      if (isConnected && corsResult.success) {
        toast.success("Connection and CORS diagnostics passed!");
      } else if (!isConnected && !corsResult.success) {
        toast.error("Both connection and CORS checks failed. See details for more information.");
      } else if (!isConnected) {
        toast.error("Connection check failed but CORS seems okay. Possible API key or network issue.");
      } else {
        toast.error("CORS check failed but basic connection worked. Possible headers issue.");
      }
    } catch (error) {
      console.error("Error during diagnostics:", error);
      setResults({
        error: true,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      toast.error("Error running diagnostics");
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = () => {
    if (!results) return "bg-gray-100";
    if (results.error) return "bg-red-50 border-red-200";
    if (results.connectionCheck && results.corsCheck?.success) return "bg-green-50 border-green-200";
    return "bg-yellow-50 border-yellow-200";
  };
  
  return (
    <Card className={`mt-4 ${getStatusColor()}`}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>Network & CORS Diagnostics</span>
          <Button 
            onClick={runCORSCheck} 
            variant="ghost" 
            size="sm"
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1">{loading ? "Running..." : "Run"}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center text-sm text-muted-foreground py-2">
            Run diagnostics to check for CORS and network connectivity issues
          </div>
        ) : results.error ? (
          <div className="flex items-center text-red-500 gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs">{results.message}</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {results.connectionCheck ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">Connection Check</span>
                </div>
                <span className={`text-xs ${results.connectionCheck ? "text-green-500" : "text-yellow-500"}`}>
                  {results.connectionCheck ? "Passed" : "Failed"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {results.corsCheck?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">CORS Check</span>
                </div>
                <span className={`text-xs ${results.corsCheck?.success ? "text-green-500" : "text-yellow-500"}`}>
                  {results.corsCheck?.success ? "Passed" : "Failed"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {navigator.onLine ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">Browser Online Status</span>
                </div>
                <span className={`text-xs ${navigator.onLine ? "text-green-500" : "text-yellow-500"}`}>
                  {navigator.onLine ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            
            {expanded && (
              <div className="mt-4 border rounded p-2 bg-gray-50 overflow-auto max-h-[200px]">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs w-full"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CORSDiagnostic;
