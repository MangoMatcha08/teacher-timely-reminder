
import { supabase } from '@/integrations/supabase/client';
import { SchoolSetup } from '@/context/ReminderContext';
import { Json, handleNetworkError } from './utils/serviceUtils';
import { getMockSchoolSetup } from './mocks/mockData';

// Helper function to convert SchoolSetup for Supabase
const sanitizeSchoolSetupForStorage = (setup: SchoolSetup): Json => {
  // Convert the SchoolSetup to a plain object to ensure it's compatible with Json type
  return JSON.parse(JSON.stringify(setup)) as Json;
};

// Function to get school setup with network error handling
export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    const { data, error } = await supabase
      .from('school_setup')
      .select('data')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, not an error
        return null;
      }
      
      if (handleNetworkError(error, 'fetching school setup')) {
        // Return mock data in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock school setup due to network error");
          return getMockSchoolSetup();
        }
      }
      
      console.error("Error fetching school setup:", error);
      throw error;
    }
    
    if (!data || !data.data) {
      return null;
    }
    
    // Parse the data if it's a string
    let setupData: any;
    if (typeof data.data === 'string') {
      try {
        setupData = JSON.parse(data.data);
      } catch (e) {
        console.error("Error parsing school setup data:", e);
        return null;
      }
    } else {
      setupData = data.data;
    }
    
    return setupData as SchoolSetup;
  } catch (error) {
    if (handleNetworkError(error, 'processing school setup')) {
      // Return mock data in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock school setup due to network error");
        return getMockSchoolSetup();
      }
    }
    console.error("Error in getSchoolSetup:", error);
    return null;
  }
};

// Function to save school setup
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup): Promise<void> => {
  try {
    const sanitizedSetup = sanitizeSchoolSetupForStorage(setup);
    
    // Check if entry exists
    const { data, error: fetchError } = await supabase
      .from('school_setup')
      .select('id')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error("Error checking for existing setup:", fetchError);
      throw fetchError;
    }
    
    if (data && data.length > 0) {
      // Update existing
      const { error } = await supabase
        .from('school_setup')
        .update({
          data: sanitizedSetup
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating school setup:", error);
        throw error;
      }
    } else {
      // Insert new with a generated UUID
      const { error } = await supabase
        .from('school_setup')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          data: sanitizedSetup
        });
      
      if (error) {
        console.error("Error inserting school setup:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in saveSchoolSetup:", error);
    throw error;
  }
};
