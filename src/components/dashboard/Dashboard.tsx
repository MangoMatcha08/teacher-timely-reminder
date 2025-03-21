
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useReminders, DayOfWeek, Reminder } from '@/context/ReminderContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, PlusCircle, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import StatCard from '@/components/dashboard/StatCard';
import QuickReminderCreator from '@/components/dashboard/QuickReminderCreator';
import Button from '@/components/shared/Button';

// Create a utility function for getting user display name
export const getUserDisplayName = (user: any): string => {
  // For Supabase users, get name from metadata
  if (user && user.user_metadata) {
    return user.user_metadata.name || user.user_metadata.full_name || user.email || 'Teacher';
  }
  // Fallback to email or default
  return user?.email || 'Teacher';
}

// Helper to get current day code
const getCurrentDayCode = (): DayOfWeek => {
  const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
};

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
  
  // Get the periods for today
  const todayCode = getCurrentDayCode();
  const periodsToday = schoolSetup?.periods
    .filter(period => period.schedules.some(s => s.dayOfWeek === todayCode))
    .sort((a, b) => {
      const aSchedule = a.schedules.find(s => s.dayOfWeek === todayCode);
      const bSchedule = b.schedules.find(s => s.dayOfWeek === todayCode);
      
      if (!aSchedule || !bSchedule) return 0;
      
      // Simple comparison assuming format like "9:00 AM"
      return aSchedule.startTime.localeCompare(bSchedule.startTime);
    }) || [];
  
  // Get reminders for each period
  const remindersByPeriod = periodsToday.map(period => {
    return {
      period,
      reminders: reminders.filter(r => 
        r.periodId === period.id && 
        r.days.includes(todayCode)
      )
    };
  });
  
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Today's Reminders" 
          value={totalTasks} 
          subtitle={`${completedTasks} completed`}
          icon="calendar"
          progress={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
        />
        
        <StatCard 
          title="Past Due" 
          value={pastDueReminders.length} 
          subtitle={pastDueReminders.length > 0 ? "Need attention" : "All caught up!"}
          icon="alert-triangle"
          variant={pastDueReminders.length > 0 ? "warning" : "success"}
        />
        
        <StatCard 
          title="Periods Today" 
          value={periodsToday.length} 
          subtitle={periodsToday.length > 0 ? `${todayCode === "M" ? "Monday" : todayCode === "T" ? "Tuesday" : todayCode === "W" ? "Wednesday" : todayCode === "Th" ? "Thursday" : "Friday"}` : "No school today"}
          icon="clock"
        />
        
        <StatCard 
          title="Quick Add" 
          value="+"
          subtitle="Create a reminder"
          icon="plus-circle"
          variant="primary"
          onClick={() => setIsQuickReminderOpen(true)}
        />
      </div>
      
      {/* Today's Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Today's Schedule</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/schedule")}
            className="flex items-center gap-1 text-sm"
          >
            View Full Schedule
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {remindersByPeriod.length > 0 ? (
            remindersByPeriod.map(({ period, reminders }) => {
              const schedule = period.schedules.find(s => s.dayOfWeek === todayCode);
              
              return (
                <div key={period.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{period.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{schedule?.startTime} - {schedule?.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  {reminders.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      <h4 className="text-xs font-medium text-muted-foreground">Reminders:</h4>
                      {reminders.map(reminder => (
                        <div key={reminder.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`remind-${reminder.id}`} 
                              checked={reminder.completed}
                              onCheckedChange={() => handleCheckReminder(reminder.id!)}
                            />
                            <label 
                              htmlFor={`remind-${reminder.id}`}
                              className={`text-sm ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {reminder.title}
                            </label>
                          </div>
                          <button 
                            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-gray-200"
                            onClick={() => handleEditReminder(reminder)}
                          >
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-muted-foreground italic">
                      No reminders for this period
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="border rounded-lg p-6 bg-gray-50 text-center">
              <p className="text-muted-foreground">No periods scheduled for today</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/create-reminder")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create a Reminder
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Today's Reminders Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Today's Reminders</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/create-reminder")}
            className="flex items-center gap-1 text-sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        </div>
        
        <div className="border rounded-lg divide-y">
          {todaysReminders.length > 0 ? (
            todaysReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className="flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={`today-${reminder.id}`}
                    checked={reminder.completed}
                    onCheckedChange={() => handleCheckReminder(reminder.id!)}
                  />
                  <div>
                    <label 
                      htmlFor={`today-${reminder.id}`}
                      className={`text-sm font-medium ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {reminder.title}
                    </label>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {reminder.periodId && schoolSetup.periods.find(p => p.id === reminder.periodId)?.name}
                      {reminder.category && ` • ${reminder.category}`}
                    </div>
                  </div>
                </div>
                <button 
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-gray-200"
                  onClick={() => handleEditReminder(reminder)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">All Done!</h3>
              <p className="text-muted-foreground">
                You don't have any reminders for today.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Reminder Creator */}
      <QuickReminderCreator 
        isOpen={isQuickReminderOpen} 
        onClose={() => setIsQuickReminderOpen(false)} 
      />
    </div>
  );
};
