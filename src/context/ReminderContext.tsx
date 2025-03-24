import React, { createContext, useState, useContext, useEffect } from 'react';
import { SchoolSetup } from '@/types';
import { schoolSetupService } from '@/services/schoolSetupService';

interface ReminderContextType {
  schoolSetup: SchoolSetup | null;
  setSchoolSetup: React.Dispatch<React.SetStateAction<SchoolSetup | null>>;
  isLoading: boolean;
  error: string | null;
  fetchSchoolSetup: (userId: string) => Promise<void>;
  saveSchoolSetup: (schoolSetup: SchoolSetup, userId: string) => Promise<boolean>;
  updateSchoolSetup: (userId: string, schoolSetup: SchoolSetup) => Promise<boolean>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolSetup, setSchoolSetup] = useState<SchoolSetup | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolSetup = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSchoolSetup = await schoolSetupService.getSchoolSetup(userId);
      setSchoolSetup(fetchedSchoolSetup);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch school setup');
      setSchoolSetup(null);
      console.error("Error fetching school setup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchoolSetup = async (schoolSetup: SchoolSetup, userId: string) => {
    try {
      await schoolSetupService.saveSchoolSetup(userId, schoolSetup);
      return true;
    } catch (error) {
      console.error("Error saving school setup:", error);
      return false;
    }
  };

  const updateSchoolSetup = async (userId: string, schoolSetup: SchoolSetup) => {
    try {
      await schoolSetupService.updateSchoolSetup(userId, schoolSetup);
      return true;
    } catch (error) {
      console.error("Error updating school setup:", error);
      return false;
    }
  };

  const value: ReminderContextType = {
    schoolSetup,
    setSchoolSetup,
    isLoading,
    error,
    fetchSchoolSetup,
    saveSchoolSetup,
    updateSchoolSetup,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = (): ReminderContextType => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminder must be used within a ReminderProvider");
  }
  return context;
};
