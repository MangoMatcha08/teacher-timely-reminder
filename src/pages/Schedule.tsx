
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import Button from "@/components/shared/Button";
import { Plus, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Schedule = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const { reminders, schoolSetup } = useReminders();
  const navigate = useNavigate();
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (!hasCompletedOnboarding) {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding, navigate]);
  
  // Get the current day code (M, T, W, Th, F)
  const getCurrentDayCode = () => {
    const dayMap: Record<number, string> = {
      1: "M",
      2: "T", 
      3: "W",
      4: "Th",
      5: "F"
    };
    const dayOfWeek = new Date().getDay();
    return dayMap[dayOfWeek] || null;
  };
  
  // Set the initial day filter to today if it's a school day
  useEffect(() => {
    const todayCode = getCurrentDayCode();
    if (todayCode && schoolSetup?.schoolDays.includes(todayCode as any)) {
      setSelectedDay(todayCode);
    }
  }, [schoolSetup]);
  
  const filteredReminders = reminders.filter(reminder => {
    let matches = true;
    
    if (selectedDay) {
      matches = matches && reminder.days.includes(selectedDay as any);
    }
    
    if (selectedPeriod) {
      matches = matches && reminder.periodId === selectedPeriod;
    }
    
    if (selectedCategory) {
      matches = matches && reminder.category === selectedCategory;
    }
    
    return matches;
  });
  
  const renderReminders = () => {
    if (filteredReminders.length === 0) {
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">No reminders match your filters</p>
          <Button onClick={() => navigate("/create-reminder")} className="h-8 text-sm">
            <Plus className="h-3 w-3 mr-1" />
            Create Reminder
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredReminders.map(reminder => (
          <Card key={reminder.id} className="overflow-hidden">
            <CardHeader className="py-2 px-3 bg-gray-50 border-b">
              <CardTitle className="text-sm font-medium">{reminder.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-xs">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{reminder.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timing:</span>
                  <span>{reminder.timing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days:</span>
                  <span>{reminder.days.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span>
                    {schoolSetup?.periods.find(p => p.id === reminder.periodId)?.name || "N/A"}
                  </span>
                </div>
                {reminder.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{reminder.category}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span>{reminder.priority}</span>
                </div>
                {reminder.notes && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Notes:</p>
                    <p className="text-xs">{reminder.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  if (!isInitialized || !isAuthenticated || !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-3 border-teacher-blue border-t-transparent animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Layout pageTitle="Schedule">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Class Schedule</h1>
          <Button 
            onClick={() => navigate("/create-reminder")}
            className="h-8 text-sm"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Reminder
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-sm">
                Day <span className="ml-1 hidden sm:inline">
                  {selectedDay ? `(${selectedDay})` : ""}
                </span>
                <Calendar className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {schoolSetup?.schoolDays.map((day) => (
                <DropdownMenuItem
                  key={day}
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="w-full text-left px-3 py-2 text-sm"
                onClick={() => setSelectedDay(null)}
              >
                All Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-sm">
                Period <span className="ml-1 hidden sm:inline">
                  {selectedPeriod ? `(${schoolSetup?.periods.find(p => p.id === selectedPeriod)?.name})` : ""}
                </span>
                <Calendar className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {schoolSetup?.periods.map((period) => (
                <DropdownMenuItem
                  key={period.id}
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => setSelectedPeriod(period.id)}
                >
                  {period.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="w-full text-left px-3 py-2 text-sm"
                onClick={() => setSelectedPeriod(null)}
              >
                All Periods
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-sm">
                Category <span className="ml-1 hidden sm:inline">
                  {selectedCategory ? `(${selectedCategory})` : ""}
                </span>
                <Calendar className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {schoolSetup?.categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="w-full text-left px-3 py-2 text-sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3">
          {renderReminders()}
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
