
import * as React from 'react';
import { Reminder, ReminderState, SchoolSetup } from '../types';
import { getTodayDayCode, isTimePassed } from '../utils';
import { User } from '@supabase/supabase-js';
import { saveReminder, deleteReminder as deleteReminderFromDB } from "@/services/supabase/reminders";
import { toast } from 'sonner';

export const createCoreReminderActions = (
  state: ReminderState,
  setState: React.Dispatch<React.SetStateAction<ReminderState>>,
  user: User | null
) => {
  
  const createReminder = async (reminderData: Omit<Reminder, "id" | "createdAt" | "completed">) => {
    const today = new Date();
    const currentDayCode = getTodayDayCode();
    const shouldBeNextWeek = reminderData.days.includes(currentDayCode) && 
                          reminderData.timing === "During Period" && 
                          isTimePassed(reminderData.periodId || "", today, state.schoolSetup);
    
    const adjustedDays = shouldBeNextWeek 
      ? reminderData.days.filter(d => d !== currentDayCode)
      : reminderData.days;
    
    // Create a temporary local ID
    const localId = `local_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create the reminder object with the local ID
    const newReminder: Reminder = {
      ...reminderData,
      days: adjustedDays,
      id: localId,
      createdAt: new Date(),
      completed: false,
      termId: state.schoolSetup?.termId || "term_default"
    };
    
    // Update local state first
    setState(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
    
    // Then try to save to Supabase if online
    if (state.isOnline && user) {
      try {
        console.log("Attempting to save reminder to Supabase:", newReminder);
        const savedReminder = await saveReminder(newReminder, user.id);
        
        // Update the local reminder with the server-generated ID
        if (savedReminder && savedReminder.id) {
          setState(prev => ({
            ...prev,
            reminders: prev.reminders.map(r => 
              r.id === localId ? { ...r, id: savedReminder.id } : r
            ),
            syncStatus: 'synced'
          }));
          console.log("Reminder saved to Supabase with ID:", savedReminder.id);
        }
      } catch (error) {
        console.error("Error saving reminder to Supabase:", error);
        setState(prev => ({
          ...prev,
          syncStatus: 'failed'
        }));
        toast.error("Failed to sync reminder. It will be saved locally only.");
      }
    } else {
      console.log("Saving reminder locally only (offline or no user)");
    }
  };
  
  const updateReminder = async (id: string, reminderData: Partial<Reminder>) => {
    // Update local state first
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder => 
        reminder.id === id ? { ...reminder, ...reminderData } : reminder
      )
    }));
    
    // Then try to update in Supabase if online
    if (state.isOnline && user && !id.startsWith('local_')) {
      try {
        // Find the updated reminder in state
        const updatedReminder = state.reminders.find(r => r.id === id);
        if (updatedReminder) {
          // Merge the updates with the existing reminder
          const reminderToSave = { ...updatedReminder, ...reminderData };
          console.log("Updating reminder in Supabase:", reminderToSave);
          await saveReminder(reminderToSave, user.id);
          setState(prev => ({ ...prev, syncStatus: 'synced' }));
        }
      } catch (error) {
        console.error("Error updating reminder in Supabase:", error);
        setState(prev => ({ ...prev, syncStatus: 'failed' }));
        toast.error("Failed to sync reminder update. Changes are saved locally only.");
      }
    }
  };
  
  const deleteReminder = async (id: string) => {
    // Update local state first
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
    
    // Then try to delete from Supabase if online
    if (state.isOnline && user && !id.startsWith('local_')) {
      try {
        console.log("Deleting reminder from Supabase:", id);
        await deleteReminderFromDB(id, user.id);
        setState(prev => ({ ...prev, syncStatus: 'synced' }));
      } catch (error) {
        console.error("Error deleting reminder from Supabase:", error);
        setState(prev => ({ ...prev, syncStatus: 'failed' }));
        toast.error("Failed to sync reminder deletion. It is removed locally only.");
      }
    }
  };
  
  const toggleReminderComplete = async (id: string) => {
    setState(prev => {
      const updatedReminders = prev.reminders.map(reminder => {
        if (reminder.id === id) {
          return { ...reminder, completed: !reminder.completed };
        }
        return reminder;
      });
      
      return {
        ...prev,
        reminders: updatedReminders
      };
    });
    
    // Then try to update in Supabase if online
    if (state.isOnline && user && !id.startsWith('local_')) {
      // Find the updated reminder in state
      const reminder = state.reminders.find(r => r.id === id);
      if (reminder) {
        try {
          const updatedReminder = { ...reminder, completed: !reminder.completed };
          console.log("Updating reminder completion status in Supabase:", updatedReminder);
          await saveReminder(updatedReminder, user.id);
          setState(prev => ({ ...prev, syncStatus: 'synced' }));
        } catch (error) {
          console.error("Error updating reminder in Supabase:", error);
          setState(prev => ({ ...prev, syncStatus: 'failed' }));
          toast.error("Failed to sync completion status. Change is saved locally only.");
        }
      }
    }
  };

  return {
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminderComplete
  };
};
