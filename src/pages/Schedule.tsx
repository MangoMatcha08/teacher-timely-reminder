
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders, DayOfWeek } from "@/context/ReminderContext";
import Layout from "@/components/shared/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import Button from "@/components/shared/Button";
import { Plus, CalendarDays } from "lucide-react";

const Schedule = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const { reminders, schoolSetup } = useReminders();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (!hasCompletedOnboarding) {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding, navigate]);
  
  // Helper function to get the schedule for a specific day
  const getPeriodScheduleForDay = (periodId: string, day: DayOfWeek) => {
    const period = schoolSetup?.periods.find(p => p.id === periodId);
    if (!period) return null;
    
    return period.schedules.find(s => s.dayOfWeek === day);
  };
  
  if (!isInitialized || !isAuthenticated) {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-teacher-blue border-t-transparent animate-spin mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Group reminders by day
  const remindersByDay: Record<string, typeof reminders> = {
    M: [],
    T: [],
    W: [],
    Th: [],
    F: [],
  };
  
  reminders.forEach((reminder) => {
    reminder.days.forEach((day) => {
      if (!remindersByDay[day]) {
        remindersByDay[day] = [];
      }
      remindersByDay[day].push(reminder);
    });
  });
  
  // Map day code to day name
  const dayNames: Record<string, string> = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
  };
  
  return (
    <Layout pageTitle="Schedule">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <Link to="/create-reminder">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              New Reminder
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schoolSetup?.schoolDays.map((day) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="border-b bg-teacher-gray/20">
                <CardTitle className="flex items-center justify-between">
                  <span>{dayNames[day]}</span>
                  <div className="rounded-full bg-teacher-blue/10 px-3 py-1 text-sm font-medium text-teacher-blue">
                    {remindersByDay[day].length} reminder{remindersByDay[day].length !== 1 ? 's' : ''}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {remindersByDay[day].length > 0 ? (
                  <ul className="divide-y">
                    {remindersByDay[day].map((reminder) => {
                      const period = schoolSetup?.periods.find(
                        (p) => p.id === reminder.periodId
                      );
                      const schedule = getPeriodScheduleForDay(reminder.periodId, day);
                      
                      return (
                        <li key={reminder.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-medium">{reminder.title}</h3>
                                <div className="px-2 py-0.5 rounded-full bg-teacher-gray text-xs font-medium text-teacher-darkGray">
                                  {reminder.type}
                                </div>
                              </div>
                              {period && (
                                <p className="text-sm text-muted-foreground">
                                  {period.name} {schedule && `(${schedule.startTime})`}
                                </p>
                              )}
                            </div>
                            {reminder.category && (
                              <div className="px-2 py-0.5 rounded-full bg-teacher-blue/10 text-xs font-medium text-teacher-blue">
                                {reminder.category}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-teacher-gray p-3 mb-3">
                      <CalendarDays className="h-6 w-6 text-teacher-darkGray" />
                    </div>
                    <p className="text-muted-foreground">
                      No reminders for {dayNames[day]}
                    </p>
                    <Link to="/create-reminder" className="mt-3">
                      <Button variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Reminder
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
