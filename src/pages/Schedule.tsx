
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders, DayOfWeek, ReminderType, ReminderPriority } from "@/context/ReminderContext";
import Layout from "@/components/shared/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import Button from "@/components/shared/Button";
import { Plus, CalendarDays, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Schedule = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const { reminders, schoolSetup, toggleReminderComplete } = useReminders();
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterPriority, setFilterPriority] = useState<ReminderPriority | undefined>();
  const [filterType, setFilterType] = useState<ReminderType | undefined>();
  
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
  
  // All days of the week, regardless of teaching days
  const allDays: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  
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
      
      // Apply filters
      if (
        (!filterCategory || reminder.category === filterCategory) &&
        (!filterPriority || reminder.priority === filterPriority) &&
        (!filterType || reminder.type === filterType)
      ) {
        remindersByDay[day].push(reminder);
      }
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
  
  // Get categories and priorities for filters
  const categories = schoolSetup?.categories || [];
  const priorities: ReminderPriority[] = ["Low", "Medium", "High"];
  const reminderTypes: ReminderType[] = [
    "Call Home",
    "Email",
    "Talk to Student",
    "Prepare Materials",
    "Grade",
    "Other"
  ];
  
  // Get priority badge color
  const getPriorityColor = (priority: ReminderPriority) => {
    switch (priority) {
      case "High": return "bg-red-500/20 text-red-700";
      case "Medium": return "bg-amber-500/20 text-amber-700";
      case "Low": return "bg-green-500/20 text-green-700";
      default: return "bg-teacher-gray text-teacher-darkGray";
    }
  };
  
  return (
    <Layout pageTitle="Schedule">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/create-reminder">
              <Button variant="primary" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Reminder
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Filter Reminders</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Types</SelectItem>
                {reminderTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allDays.map((day) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="border-b bg-teacher-gray/20 py-3">
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
                        <li key={reminder.id} className={`p-4 transition-colors ${reminder.completed ? "bg-gray-50" : ""}`}>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleReminderComplete(reminder.id)}
                              className="mt-1 flex-shrink-0 focus:outline-none"
                            >
                              {reminder.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-teacher-teal" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-teacher-darkGray/30 hover:border-teacher-teal transition-colors" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className={`font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {reminder.title}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                  <div className="px-2 py-0.5 rounded-full bg-teacher-gray text-xs font-medium text-teacher-darkGray">
                                    {reminder.type}
                                  </div>
                                  {reminder.priority && (
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                                      {reminder.priority}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-1">
                                {period && (
                                  <p className="text-sm text-muted-foreground">
                                    {period.name} {schedule && `(${schedule.startTime})`} • {reminder.timing}
                                  </p>
                                )}
                                {reminder.category && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Category: {reminder.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="rounded-full bg-teacher-gray p-3 mb-3">
                      <CalendarDays className="h-5 w-5 text-teacher-darkGray" />
                    </div>
                    <p className="text-muted-foreground text-sm">
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
