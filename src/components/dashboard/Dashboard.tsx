
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useReminders, Reminder } from '@/context/ReminderContext';
import { toast } from 'sonner';
import QuickReminderCreator from '@/components/dashboard/QuickReminderCreator';
import Button from '@/components/shared/Button';
import DashboardStats from '@/components/dashboard/DashboardStats';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import TodayReminders from '@/components/dashboard/TodayReminders';
import { getUserDisplayName, getCurrentDayCode, groupRemindersByPeriod } from './dashboardUtils';

// Export the Dashboard component
export const Dashboard = () => {
  const { user } = useAuth();
  const { 
    schoolSetup, 
    todaysReminders, 
    pastDueReminders, 
    completedTasks, 
    totalTasks,
    toggleReminderComplete,
    reminders 
  } = useReminders();
  const navigate = useNavigate();
  const [isQuickReminderOpen, setIsQuickReminderOpen] = useState(false);
  
  const userName = getUserDisplayName(user);
  const todayCode = getCurrentDayCode();
  
  const remindersByPeriod = schoolSetup ? 
    groupRemindersByPeriod(schoolSetup.periods, reminders, todayCode) : [];
  
  const handleCheckReminder = (id: string) => {
    toggleReminderComplete(id);
    toast.success("Reminder marked as complete!");
  };
  
  const handleEditReminder = (reminder: Reminder) => {
    // This would be implemented in a future update to edit reminders
    toast.info("Edit reminder functionality coming soon!");
  };
  
  if (!schoolSetup) {
    return (
      <div className="text-center p-6">
        <h2 className="text-lg font-semibold mb-2">Welcome to Teacher Reminder</h2>
        <p className="text-muted-foreground mb-4">
          It looks like you haven't set up your school schedule yet.
        </p>
        <Button onClick={() => navigate("/onboarding")}>
          Complete Setup
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your day and upcoming reminders.
        </p>
      </div>
      
      {/* Stats Cards */}
      <DashboardStats 
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        pastDueRemindersCount={pastDueReminders.length}
        periodsTodayCount={remindersByPeriod.length}
        todayCode={todayCode}
        onQuickAddClick={() => setIsQuickReminderOpen(true)}
      />
      
      {/* Today's Reminders - Moved above Today's Schedule */}
      <TodayReminders 
        todaysReminders={todaysReminders}
        handleCheckReminder={handleCheckReminder}
        handleEditReminder={handleEditReminder}
        schoolSetup={schoolSetup}
      />
      
      {/* Today's Schedule */}
      <TodaySchedule 
        remindersByPeriod={remindersByPeriod}
        handleCheckReminder={handleCheckReminder}
        handleEditReminder={handleEditReminder}
        todayCode={todayCode}
      />
      
      {/* Quick Reminder Creator */}
      <QuickReminderCreator 
        isOpen={isQuickReminderOpen} 
        onClose={() => setIsQuickReminderOpen(false)} 
        onComplete={() => {}}
      />
    </div>
  );
};
