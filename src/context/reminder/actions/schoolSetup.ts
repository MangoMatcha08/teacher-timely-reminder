
import * as React from 'react';
import { ReminderState, SchoolSetup } from '../types';
import { User } from '@supabase/supabase-js';

export const createSchoolSetupActions = (
  state: ReminderState,
  setState: React.Dispatch<React.SetStateAction<ReminderState>>,
  user: User | null
) => {
  
  const saveSchoolSetup = (setup: SchoolSetup) => {
    setState(prev => ({
      ...prev,
      schoolSetup: setup
    }));
    
    if (state.isOnline && user) {
      import("@/services/supabase/schoolSetup").then(({ saveSchoolSetup }) => {
        try {
          saveSchoolSetup(user.id, setup);
        } catch (error) {
          console.error("Error saving school setup to Supabase:", error);
        }
      });
    }
  };

  return {
    saveSchoolSetup
  };
};
