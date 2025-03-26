
import { supabase } from "@/integrations/supabase/client";
import { SchoolSetup } from "@/context/ReminderContext";
import { handleSupabaseError } from "./utils";

/**
 * Save school setup to the database
 */
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup): Promise<void> => {
  try {
    // Check if we're using a test account - maintain compatibility
    if (userId.startsWith("test-user-")) {
      localStorage.setItem(`schoolSetup_${userId}`, JSON.stringify(setup));
      return;
    }
    
    // Supabase storage for regular accounts
    // Check if setup already exists for this user
    const { data: existingSetup, error: checkError } = await supabase
      .from('school_setup')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Convert SchoolSetup to a format that can be stored in jsonb
    const setupForDb = JSON.parse(JSON.stringify(setup));
    
    if (existingSetup) {
      // Update existing setup
      const { error } = await supabase
        .from('school_setup')
        .update({ data: setupForDb })
        .eq('id', existingSetup.id);
        
      if (error) throw error;
    } else {
      // Insert new setup - generate a UUID on the client side for compatibility
      const uuid = crypto.randomUUID ? crypto.randomUUID() : `gen-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      const { error } = await supabase
        .from('school_setup')
        .insert({ id: uuid, user_id: userId, data: setupForDb });
        
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error saving school setup:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Get school setup for a user
 */
export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    // Check if we're using a test account - maintain compatibility
    if (userId.startsWith("test-user-")) {
      const setupStr = localStorage.getItem(`schoolSetup_${userId}`);
      return setupStr ? JSON.parse(setupStr) : null;
    }
    
    // Supabase fetching for regular accounts
    const { data, error } = await supabase
      .from('school_setup')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data && data.data) {
      // Convert from jsonb to SchoolSetup
      return data.data as unknown as SchoolSetup;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting school setup:", error);
    throw handleSupabaseError(error);
  }
};
