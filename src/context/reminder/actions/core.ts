
import * as React from 'react';
import { Reminder, ReminderState, SchoolSetup } from '../types';
import { getTodayDayCode, isTimePassed } from '../utils';
import { User } from '@supabase/supabase-js';
import { saveReminder, deleteReminder as deleteReminderFromDB } from "@/services/supabase/reminders";

export const createCoreReminderActions = (
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
      try {
        saveReminder(newReminder, user.id);
      } catch (error) {
        console.error("Error saving reminder to Supabase:", error);
      }
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
        try {
          saveReminder(reminderToSave, user.id);
        } catch (error) {
          console.error("Error updating reminder in Supabase:", error);
        }
      }
    }
  };
  
  const deleteReminder = (id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
    
    if (state.isOnline && user) {
      try {
        deleteReminderFromDB(id, user.id);
      } catch (error) {
        console.error("Error deleting reminder from Supabase:", error);
      }
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
            try {
              saveReminder(reminderToUpdate, user.id);
            } catch (error) {
              console.error("Error updating reminder in Supabase:", error);
            }
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

  return {
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminderComplete
  };
};
