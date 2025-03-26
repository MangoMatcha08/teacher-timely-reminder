
import * as React from 'react';
import { ReminderState } from './types';
import { User } from '@supabase/supabase-js';
import { createCoreReminderActions } from './actions/core';
import { createSchoolSetupActions } from './actions/schoolSetup';
import { createSyncActions } from './actions/sync';

export const createReminderActions = (
  state: ReminderState,
  setState: React.Dispatch<React.SetStateAction<ReminderState>>,
  user: User | null
) => {
  const coreActions = createCoreReminderActions(state, setState, user);
  const schoolSetupActions = createSchoolSetupActions(state, setState, user);
  const syncActions = createSyncActions(state, setState, user);
  
  return {
    ...coreActions,
    ...schoolSetupActions,
    ...syncActions
  };
};

// Re-export sync resolver functions
export {
  syncReminder,
  deleteReminderFromCloud,
  fetchRemindersFromCloud
} from './actions/sync';
