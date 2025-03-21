
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface FeedbackRequest {
  userId?: string;
  userEmail?: string;
  feedbackType: string;
  feedback: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get the request body
    const { userId, userEmail, feedbackType, feedback }: FeedbackRequest = await req.json();

    // Validate inputs
    if (!feedback) {
      return new Response(
        JSON.stringify({ error: "Feedback text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // In a real implementation, you would store this in the database
    // and/or send it to your feedback management system
    
    console.log("Received feedback:", {
      userId,
      userEmail,
      feedbackType,
      feedback,
      timestamp: new Date().toISOString()
    });

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback received. Thank you!",
        data: {
          id: `feedback_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-feedback function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
