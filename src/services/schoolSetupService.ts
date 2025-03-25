
import { supabase } from '@/integrations/supabase/client';
import { SchoolSetup, DayOfWeek } from '@/types';
import { handleNetworkError } from './utils/serviceUtils';
import { getMockSchoolSetup } from './mocks/mockData';

interface SchoolSetupService {
  getSchoolSetup: (userId: string) => Promise<SchoolSetup | null>;
  saveSchoolSetup: (userId: string, schoolSetup: SchoolSetup) => Promise<void>;
  updateSchoolSetup: (userId: string, schoolSetup: SchoolSetup) => Promise<void>;
}

export const schoolSetupService: SchoolSetupService = {
  getSchoolSetup: async (userId: string): Promise<SchoolSetup | null> => {
    try {
      const { data, error } = await supabase
        .from('school_setup')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (handleNetworkError(error, 'fetching school setup')) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Using mock school setup due to network error");
            return getMockSchoolSetup();
          }
        }
        throw error;
      }
      
      if (!data) {
        return createDefaultSchoolSetup(userId);
      }
      
      return parseSchoolSetupFromStorage(data);
    } catch (error) {
      if (handleNetworkError(error, 'processing school setup')) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock school setup due to error");
          return getMockSchoolSetup();
        }
      }
      console.error("Error in getSchoolSetup:", error);
      return createDefaultSchoolSetup(userId);
    }
  },
  
  saveSchoolSetup: async (userId: string, schoolSetup: SchoolSetup): Promise<void> => {
    try {
      // Create a UUID for the new school setup
      const id = crypto.randomUUID();
      
      // Convert the schoolSetup object to a stringified JSON
      const dataToSave = JSON.stringify({
        school_name: schoolSetup.schoolName,
        school_year: schoolSetup.schoolYear,
        terms: schoolSetup.terms,
        periods: schoolSetup.periods,
        days: schoolSetup.days,
        categories: schoolSetup.categories,
        notification_preferences: schoolSetup.notificationPreferences
      });
      
      const { error } = await supabase
        .from('school_setup')
        .insert({
          id: id,
          user_id: userId,
          data: JSON.parse(dataToSave)
        });
      
      if (error) {
        if (handleNetworkError(error, 'saving school setup')) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Pretending to save school setup due to network error");
            return;
          }
        }
        throw error;
      }
    } catch (error) {
      console.error("Error in saveSchoolSetup:", error);
      throw error;
    }
  },
  
  updateSchoolSetup: async (userId: string, schoolSetup: SchoolSetup): Promise<void> => {
    try {
      // Convert the schoolSetup object to a stringified JSON
      const dataToUpdate = JSON.stringify({
        school_name: schoolSetup.schoolName,
        school_year: schoolSetup.schoolYear,
        terms: schoolSetup.terms,
        periods: schoolSetup.periods,
        days: schoolSetup.days,
        categories: schoolSetup.categories,
        notification_preferences: schoolSetup.notificationPreferences
      });
      
      const { error } = await supabase
        .from('school_setup')
        .update({
          data: JSON.parse(dataToUpdate)
        })
        .eq('user_id', userId);
      
      if (error) {
        if (handleNetworkError(error, 'updating school setup')) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Pretending to update school setup due to network error");
            return;
          }
        }
        throw error;
      }
    } catch (error) {
      console.error("Error in updateSchoolSetup:", error);
      throw error;
    }
  }
};

// Helper function to create a default school setup
const createDefaultSchoolSetup = (userId: string): SchoolSetup => {
  return {
    userId,
    schoolName: "My School",
    schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    terms: [
      {
        id: "term-1",
        name: "Fall Semester",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString()
      }
    ],
    periods: [
      {
        id: "period-1",
        name: "Period 1",
        schedules: [
          {
            dayOfWeek: DayOfWeek.Monday,
            startTime: "08:00 AM",
            endTime: "09:00 AM"
          }
        ]
      }
    ],
    days: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
    categories: ["Homework", "Tests", "Projects", "Meetings"]
  };
};

// Helper function to parse school setup from storage
const parseSchoolSetupFromStorage = (data: any): SchoolSetup => {
  const schoolData = data.data || {};
  return {
    id: data.id,
    userId: data.user_id,
    schoolName: schoolData.school_name || "My School",
    schoolYear: schoolData.school_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    terms: schoolData.terms || [],
    periods: schoolData.periods || [],
    days: schoolData.days || [],
    categories: schoolData.categories || [],
    notificationPreferences: schoolData.notification_preferences,
    termId: schoolData.term_id,
    schoolDays: schoolData.school_days
  };
};
