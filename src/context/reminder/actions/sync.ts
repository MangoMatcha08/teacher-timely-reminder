
import * as React from 'react';
import { Reminder, ReminderState, ReminderType, ReminderTiming, DayOfWeek, RecurrencePattern, ReminderPriority } from '../types';
import { User } from '@supabase/supabase-js';
import { saveToFirebase } from '../utils';
import { getReminders, saveReminder, deleteReminder as deleteReminderFromDB } from "@/services/supabase/reminders";

export const createSyncActions = (
  state: ReminderState,
  setState: React.Dispatch<React.SetStateAction<ReminderState>>,
  user: User | null
) => {
  
  const syncWithCloud = async () => {
    if (!user || !state.isOnline) return;
    
    try {
      setState(prev => ({ ...prev, syncStatus: 'pending' }));
      await saveToFirebase(state, user);
      setState(prev => ({ ...prev, syncStatus: 'synced' }));
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      setState(prev => ({ ...prev, syncStatus: 'failed' }));
    }
  };
  
  const fetchReminders = () => {
    if (user) {
      getReminders(user.id, state.schoolSetup?.termId)
        .then(fetchedReminders => {
          if (fetchedReminders.length > 0) {
            // Convert string dates to actual Date objects and ensure correct typing
            const typedReminders: Reminder[] = fetchedReminders.map(reminder => ({
              ...reminder,
              type: reminder.type as ReminderType || "_none",
              timing: reminder.timing as ReminderTiming,
              days: reminder.days as DayOfWeek[],
              recurrence: reminder.recurrence as RecurrencePattern,
              priority: reminder.priority as ReminderPriority,
              createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
              completed: reminder.completed || false
            }));
            
            setState(prev => ({ 
              ...prev, 
              reminders: typedReminders
            }));
          }
        })
        .catch(error => console.error("Error fetching reminders:", error));
      
      import("@/services/supabase/schoolSetup").then(({ getSchoolSetup }) => {
        getSchoolSetup(user.id)
          .then(schoolSetup => {
            if (schoolSetup) {
              setState(prev => ({ ...prev, schoolSetup }));
            }
          })
          .catch(error => console.error("Error fetching school setup:", error));
      });
    }
  };

  return {
    syncWithCloud,
    fetchReminders
  };
};

// Resolver functions to handle async reminders operations
export const syncReminder = async (
  reminder: Reminder, 
  userId: string | null
) => {
  if (!userId) {
    console.error("Cannot sync reminder: No user ID provided");
    return null;
  }

  try {
    const syncedReminder = await saveReminder(reminder, userId);
    return syncedReminder;
  } catch (error) {
    console.error("Error syncing reminder:", error);
    return null;
  }
};

export const deleteReminderFromCloud = async (
  reminderId: string,
  userId: string | null
) => {
  if (!userId) {
    console.error("Cannot delete reminder from cloud: No user ID provided");
    return false;
  }

  try {
    await deleteReminderFromDB(reminderId, userId);
    return true;
  } catch (error) {
    console.error("Error deleting reminder from cloud:", error);
    return false;
  }
};

export const fetchRemindersFromCloud = async (
  userId: string | null,
  termId: string | undefined
) => {
  if (!userId) {
    console.error("Cannot fetch reminders: No user ID provided");
    return [];
  }

  try {
    const reminders = await getReminders(userId, termId);
    return reminders;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }
};
