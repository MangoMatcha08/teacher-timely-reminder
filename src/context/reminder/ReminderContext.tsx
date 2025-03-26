
import * as React from 'react';
import { ReminderContextType, ReminderState } from './types';
import { createReminderActions } from './actions';
import { createReminderSelectors } from './selectors';
import { loadFromFirebase } from './utils/cloudSyncUtils';
import { loadFromLocalStorage } from './utils/storageUtils';
import { useAuth } from '../AuthContext';

// Create the context with a default value
const ReminderContext = React.createContext<ReminderContextType>({
  reminders: [],
  schoolSetup: null,
  isOnline: false,
  syncStatus: 'synced',
  createReminder: () => {},
  updateReminder: () => {},
  deleteReminder: () => {},
  saveSchoolSetup: () => {},
  toggleReminderComplete: () => {},
  syncWithCloud: async () => {},
  fetchReminders: () => {},
  todaysReminders: [],
  filteredReminders: () => [],
  completedTasks: 0,
  totalTasks: 0
});

// Hook for consuming the context
export const useReminders = () => React.useContext(ReminderContext);

// Provider component
export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = React.useState<ReminderState>({
    reminders: [],
    schoolSetup: null,
    isOnline: navigator.onLine,
    syncStatus: 'synced'
  });
  
  // Set up online/offline event listeners
  React.useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load data from Firebase when authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      loadFromFirebase(user)
        .then(({ reminders, schoolSetup }) => {
          if (reminders.length > 0 || schoolSetup) {
            setState(prev => ({
              ...prev,
              reminders: reminders.length > 0 ? reminders : prev.reminders,
              schoolSetup: schoolSetup || prev.schoolSetup,
              syncStatus: 'synced'
            }));
          }
        })
        .catch(error => {
          console.error("Error loading data from Firebase:", error);
          setState(prev => ({ ...prev, syncStatus: 'failed' }));
        });
    }
  }, [isAuthenticated, user]);
  
  // Load data from localStorage on initial render
  React.useEffect(() => {
    const { reminders, schoolSetup } = loadFromLocalStorage();
    setState(prev => ({
      ...prev,
      reminders: reminders.length > 0 ? reminders : prev.reminders,
      schoolSetup: schoolSetup || prev.schoolSetup
    }));
  }, []);
  
  // Save reminders to localStorage when they change
  React.useEffect(() => {
    if (state.reminders.length > 0) {
      localStorage.setItem("teacher_reminders", JSON.stringify(state.reminders));
    }
  }, [state.reminders]);
  
  // Save school setup to localStorage when it changes
  React.useEffect(() => {
    if (state.schoolSetup) {
      localStorage.setItem("school_setup", JSON.stringify(state.schoolSetup));
    }
  }, [state.schoolSetup]);
  
  // Create actions and selectors
  const actions = React.useMemo(() => createReminderActions(state, setState, user), [state, user]);
  const selectors = React.useMemo(() => createReminderSelectors(state), [state]);
  
  // Combine everything into the context value
  const contextValue = React.useMemo(() => ({
    ...state,
    ...actions,
    ...selectors
  }), [state, actions, selectors]);
  
  return (
    <ReminderContext.Provider value={contextValue}>
      {children}
    </ReminderContext.Provider>
  );
};

// Re-export the types
export * from './types';
