
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Calendar, CheckCircle2, Clock, Plus } from "lucide-react";
import { useReminders, type Reminder, Period, DayOfWeek } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const { todaysReminders, schoolSetup, deleteReminder } = useReminders();
  const [completedReminders, setCompletedReminders] = useState<string[]>([]);
  
  // Helper to get today's day code
  const getTodayDayCode = (): DayOfWeek => {
    const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
    const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
    return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
  };
  
  const toggleReminderCompletion = (id: string) => {
    if (completedReminders.includes(id)) {
      setCompletedReminders(completedReminders.filter((remId) => remId !== id));
    } else {
      setCompletedReminders([...completedReminders, id]);
      toast.success("Reminder marked as completed!");
    }
  };
  
  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
    toast.success("Reminder deleted successfully!");
  };
  
  // Group reminders by period
  const remindersByPeriod: Record<string, Reminder[]> = {};
  
  // First, populate with all periods to ensure they appear in order
  if (schoolSetup?.periods) {
    schoolSetup.periods.forEach((period) => {
      remindersByPeriod[period.id] = [];
    });
  }
  
  // Then add reminders to each period
  todaysReminders.forEach((reminder) => {
    if (!remindersByPeriod[reminder.periodId]) {
      remindersByPeriod[reminder.periodId] = [];
    }
    remindersByPeriod[reminder.periodId].push(reminder);
  });
  
  // Get period details
  const getPeriodDetails = (periodId: string): Period | undefined => {
    return schoolSetup?.periods.find((p) => p.id === periodId);
  };
  
  // Get today's schedule for a period
  const getTodaySchedule = (period: Period | undefined) => {
    if (!period) return null;
    
    const todayDayCode = getTodayDayCode();
    return period.schedules.find(schedule => schedule.dayOfWeek === todayDayCode);
  };
  
  // Get reminder type badge color
  const getReminderTypeColor = (type: string): string => {
    switch (type) {
      case "Pop Quiz":
        return "bg-teacher-blue/10 text-teacher-blue";
      case "Collect Work":
        return "bg-teacher-teal/10 text-teacher-teal";
      case "Hand Out":
        return "bg-teacher-indigo/10 text-teacher-indigo";
      case "Announcement":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-teacher-gray text-teacher-darkGray";
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Today's Reminders</h1>
        <Link to="/create-reminder">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Reminder
          </Button>
        </Link>
      </div>
      
      {Object.keys(remindersByPeriod).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-teacher-gray p-3 mb-4">
              <Calendar className="h-6 w-6 text-teacher-darkGray" />
            </div>
            <h3 className="text-lg font-medium mb-1">No reminders for today</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first reminder to get started
            </p>
            <Link to="/create-reminder">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Reminder
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(remindersByPeriod).map(([periodId, reminders]) => {
            if (reminders.length === 0) return null;
            
            const periodDetails = getPeriodDetails(periodId);
            const todaySchedule = getTodaySchedule(periodDetails);
            
            return (
              <Card key={periodId}>
                <CardHeader className="border-b">
                  <CardTitle>
                    <div className="flex items-center justify-between">
                      <span>{periodDetails?.name || "Unknown Period"}</span>
                      <Badge variant="blue" className="gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {todaySchedule
                            ? `${todaySchedule.startTime} - ${todaySchedule.endTime}`
                            : "No time set"}
                        </span>
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {reminders.map((reminder) => (
                      <li
                        key={reminder.id}
                        className={`p-4 transition-colors ${
                          completedReminders.includes(reminder.id)
                            ? "bg-teacher-gray/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => toggleReminderCompletion(reminder.id)}
                              className="mt-1 flex-shrink-0 focus:outline-none"
                            >
                              {completedReminders.includes(reminder.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-teacher-teal" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-teacher-darkGray/30 hover:border-teacher-teal transition-colors" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`font-medium ${
                                    completedReminders.includes(reminder.id)
                                      ? "line-through text-muted-foreground"
                                      : ""
                                  }`}
                                >
                                  {reminder.title}
                                </h3>
                                <div
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getReminderTypeColor(
                                    reminder.type
                                  )}`}
                                >
                                  {reminder.type}
                                </div>
                                {reminder.category && (
                                  <div className="px-2 py-0.5 rounded-full bg-teacher-gray text-xs font-medium text-teacher-darkGray">
                                    {reminder.category}
                                  </div>
                                )}
                              </div>
                              {reminder.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {reminder.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <span className="sr-only">Delete</span>
                            <AlertCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
