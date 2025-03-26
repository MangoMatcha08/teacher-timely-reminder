
import * as React from 'react';
import { Reminder, ReminderState, SchoolSetup } from './types';
import { getTodayDayCode, isTimePassed, saveToFirebase } from './utils';
import { User } from 'firebase/auth';
import * as FirebaseService from "@/services/firebase";

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
      FirebaseService.saveReminder(newReminder, user.uid)
        .catch(error => console.error("Error saving reminder to Firebase:", error));
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
      FirebaseService.updateReminder(id, reminderData)
        .catch(error => console.error("Error updating reminder in Firebase:", error));
    }
  };
  
  const deleteReminder = (id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
    
    if (state.isOnline && user) {
      FirebaseService.deleteReminder(id)
        .catch(error => console.error("Error deleting reminder from Firebase:", error));
    }
  };
  
  const saveSchoolSetup = (setup: SchoolSetup) => {
    setState(prev => ({
      ...prev,
      schoolSetup: setup
    }));
    
    if (state.isOnline && user) {
      FirebaseService.saveSchoolSetup(user.uid, setup)
        .catch(error => console.error("Error saving school setup to Firebase:", error));
    }
  };
  
  const toggleReminderComplete = (id: string) => {
    setState(prev => {
      const updatedReminders = prev.reminders.map(reminder => {
        if (reminder.id === id) {
          const completed = !reminder.completed;
          
          if (state.isOnline && user) {
            FirebaseService.updateReminder(id, { completed })
              .catch(error => console.error("Error updating reminder in Firebase:", error));
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
      FirebaseService.getUserReminders(user.uid)
        .then(reminders => {
          if (reminders.length > 0) {
            setState(prev => ({ ...prev, reminders }));
          }
        })
        .catch(error => console.error("Error fetching reminders:", error));
      
      FirebaseService.getSchoolSetup(user.uid)
        .then(schoolSetup => {
          if (schoolSetup) {
            setState(prev => ({ ...prev, schoolSetup }));
          }
        })
        .catch(error => console.error("Error fetching school setup:", error));
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
