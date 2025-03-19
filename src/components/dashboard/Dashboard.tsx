
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Flag, 
  Gauge, 
  Plus, 
  Settings, 
  Tag 
} from "lucide-react";
import { useReminders, type Reminder, Period, DayOfWeek, ReminderType, ReminderPriority } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import QuickReminderCreator from "@/components/dashboard/QuickReminderCreator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import StatCard from "@/components/dashboard/StatCard";
import { Link as RouterLink } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { todaysReminders, schoolSetup, deleteReminder, toggleReminderComplete } = useReminders();
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterPriority, setFilterPriority] = useState<ReminderPriority | undefined>();
  const [filterType, setFilterType] = useState<ReminderType | undefined>();
  const [showCompleted, setShowCompleted] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  
  // Helper to get today's day code
  const getTodayDayCode = (): DayOfWeek => {
    const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
    const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
    return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
  };
  
  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
    toast.success("Reminder deleted successfully!");
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
  
  // Filter reminders based on criteria
  const filteredReminders = todaysReminders.filter(reminder => {
    if (!showCompleted && reminder.completed) {
      return false;
    }
    if (filterCategory && reminder.category !== filterCategory) {
      return false;
    }
    if (filterPriority && reminder.priority !== filterPriority) {
      return false;
    }
    if (filterType && reminder.type !== filterType) {
      return false;
    }
    return true;
  });
  
  // Calculate progress percentage
  const completedCount = todaysReminders.filter(r => r.completed).length;
  const totalCount = todaysReminders.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // Group reminders by period
  const remindersByPeriod: Record<string, Reminder[]> = {};
  
  // First, populate with all periods to ensure they appear in order
  if (schoolSetup?.periods) {
    schoolSetup.periods.forEach((period) => {
      remindersByPeriod[period.id] = [];
    });
  }
  
  // Then add reminders to each period
  filteredReminders.forEach((reminder) => {
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
      case "Call Home":
        return "bg-teacher-blue/10 text-teacher-blue";
      case "Email":
        return "bg-teacher-teal/10 text-teacher-teal";
      case "Talk to Student":
        return "bg-teacher-indigo/10 text-teacher-indigo";
      case "Prepare Materials":
        return "bg-amber-500/10 text-amber-500";
      case "Grade":
        return "bg-purple-500/10 text-purple-700";
      case "Other":
        return "bg-teacher-gray text-teacher-darkGray";
      default:
        return "bg-teacher-gray text-teacher-darkGray";
    }
  };
  
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
    <div className="space-y-6 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <StatCard
          title="Today"
          count={todaysReminders.filter(r => !r.completed).length}
          icon={<Calendar className="h-5 w-5 text-white" />}
          iconBg="bg-teacher-blue"
          to="/dashboard"
        />
        <StatCard
          title="Completed"
          count={completedCount}
          icon={<CheckCircle2 className="h-5 w-5 text-white" />}
          iconBg="bg-green-500"
          to="/dashboard?completed=true"
        />
        <StatCard
          title="Flagged"
          count={todaysReminders.filter(r => r.priority === "High").length}
          icon={<Flag className="h-5 w-5 text-white" />}
          iconBg="bg-red-500"
          to="/dashboard?priority=High"
        />
        <StatCard
          title="Progress"
          icon={<Gauge className="h-5 w-5 text-white" />}
          iconBg="bg-purple-500"
          customContent={
            <div className="w-full mt-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completedCount}/{totalCount} completed
              </p>
            </div>
          }
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <h1 className="text-2xl font-bold">Today's Reminders</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterCategory || filterPriority || filterType || !showCompleted) && (
              <span className="flex h-2 w-2 rounded-full bg-teacher-blue"></span>
            )}
          </Button>
          
          <Link to="/settings">
            <Button variant="outline" className="w-auto">
              <Settings className="w-4 h-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-auto sm:w-auto"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
          
          <Link to="/create-reminder">
            <Button variant="primary" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Reminder
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Quick Create Form */}
      {showQuickCreate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Add Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickReminderCreator onComplete={() => setShowQuickCreate(false)} />
          </CardContent>
        </Card>
      )}
      
      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
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
                    <SelectValue placeholder="All Priorities" />
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
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>All Types</SelectItem>
                    {reminderTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2 bg-gray-50 px-3 rounded-md">
                  <input 
                    type="checkbox" 
                    id="show-completed" 
                    checked={showCompleted} 
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="show-completed" className="text-sm text-gray-700">
                    Show completed
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setFilterCategory(undefined);
                    setFilterPriority(undefined);
                    setFilterType(undefined);
                    setShowCompleted(true);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
      
      {Object.keys(remindersByPeriod).length === 0 || filteredReminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-teacher-gray p-3 mb-4">
              <Calendar className="h-6 w-6 text-teacher-darkGray" />
            </div>
            <h3 className="text-lg font-medium mb-1">No reminders for today</h3>
            <p className="text-muted-foreground text-center mb-6">
              {filteredReminders.length === 0 && todaysReminders.length > 0 
                ? "Try changing your filters to see reminders" 
                : "Create your first reminder to get started"}
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
                <CardHeader className="border-b py-3">
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
                          reminder.completed
                            ? "bg-gray-50"
                            : ""
                        }`}
                      >
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
                              <h3
                                className={`font-medium ${
                                  reminder.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {reminder.title}
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getReminderTypeColor(reminder.type)}`}>
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
                              <p className="text-sm text-muted-foreground">
                                {reminder.timing}
                                {reminder.category && ` • ${reminder.category}`}
                              </p>
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
