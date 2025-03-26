
import * as React from 'react';
import { Reminder, ReminderState, SchoolSetup } from './types';
import { getTodayDayCode, isTimePassed, saveToFirebase } from './utils';
import { User } from '@supabase/supabase-js';
import { saveReminder, getReminders, deleteReminder } from "@/services/supabase/reminders";

export const createReminderActions = (
  state: ReminderState,
  setState: React.Dispatch<React.SetStateAction<ReminderState>>,
  user: User | null
) => {
  
  const createReminder = (reminderData: Omit<Reminder, "id" | "createdAt" | "completed">) => {
    const today = new Date();
    const currentDayCode = getTodayDayCode();
    const shouldBeNextWeek = reminderData.days.includes(currentDayCode) && 
                            reminderData.timing === "During Period" && 
                            isTimePassed(reminderData.periodId || "", today, state.schoolSetup);
    
    const adjustedDays = shouldBeNextWeek 
      ? reminderData.days.filter(d => d !== currentDayCode)
      : reminderData.days;
    
    const newReminder: Reminder = {
      ...reminderData,
      days: adjustedDays,
      id: `rem_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
      completed: false,
      termId: state.schoolSetup?.termId || "term_default"
    };
    
    setState(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
    
    if (state.isOnline && user) {
      saveReminder(newReminder, user.id)
        .catch(error => console.error("Error saving reminder to Supabase:", error));
    }
  };
  
  const updateReminder = (id: string, reminderData: Partial<Reminder>) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder => 
        reminder.id === id ? { ...reminder, ...reminderData } : reminder
      )
    }));
    
    if (state.isOnline && user) {
      // Find the updated reminder in state
      const updatedReminder = state.reminders.find(r => r.id === id);
      if (updatedReminder) {
        // Merge the updates with the existing reminder
        const reminderToSave = { ...updatedReminder, ...reminderData };
        saveReminder(reminderToSave, user.id)
          .catch(error => console.error("Error updating reminder in Supabase:", error));
      }
    }
  };
  
  const deleteReminder = (id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
    
    if (state.isOnline && user) {
      deleteReminder(id, user.id)
        .catch(error => console.error("Error deleting reminder from Supabase:", error));
    }
  };
  
  const saveSchoolSetup = (setup: SchoolSetup) => {
    setState(prev => ({
      ...prev,
      schoolSetup: setup
    }));
    
    if (state.isOnline && user) {
      import("@/services/supabase/schoolSetup").then(({ saveSchoolSetup }) => {
        saveSchoolSetup(user.id, setup)
          .catch(error => console.error("Error saving school setup to Supabase:", error));
      });
    }
  };
  
  const toggleReminderComplete = (id: string) => {
    setState(prev => {
      const updatedReminders = prev.reminders.map(reminder => {
        if (reminder.id === id) {
          const completed = !reminder.completed;
          
          if (state.isOnline && user) {
            // Find the updated reminder in state
            const reminderToUpdate = { ...reminder, completed };
            saveReminder(reminderToUpdate, user.id)
              .catch(error => console.error("Error updating reminder in Supabase:", error));
          }
          
          return { ...reminder, completed };
        }
        return reminder;
      });
      
      return {
        ...prev,
        reminders: updatedReminders
      };
    });
  };
  
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
        .then(reminders => {
          if (reminders.length > 0) {
            setState(prev => ({ ...prev, reminders }));
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
    createReminder,
    updateReminder,
    deleteReminder,
    saveSchoolSetup,
    toggleReminderComplete,
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
    await deleteReminder(reminderId, userId);
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
