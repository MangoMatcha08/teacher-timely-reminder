
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/context/ReminderContext";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import ScheduleFilters from "@/components/schedule/ScheduleFilters";
import ReminderCardList from "@/components/schedule/ReminderCardList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, ListChecks, CalendarDays } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { useMobileView } from "@/hooks/use-mobile-view";

const Schedule = () => {
  const { isAuthenticated, isInitialized, hasCompletedOnboarding } = useAuth();
  const { reminders, schoolSetup } = useReminders();
  const navigate = useNavigate();
  const { isMobile } = useMobileView();
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "today" | "week">("today");
  const [currentDate] = useState(new Date());
  
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
  
  const handleViewChange = (newView: string) => {
    setView(newView as "list" | "today" | "week");
  };
  
  // Generate an array of the week days for display
  const weekDays = () => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 5 }, (_, i) => addDays(startDay, i));
  };
  
  // Get day code from date (M, T, W, Th, F)
  const getDayCodeFromDate = (date: Date) => {
    const dayMap: Record<number, string> = {
      1: "M",
      2: "T", 
      3: "W",
      4: "Th",
      5: "F"
    };
    return dayMap[date.getDay()] || null;
  };
  
  // Format day with date for display
  const formatDayWithDate = (date: Date) => {
    const dayCode = getDayCodeFromDate(date);
    const dateStr = format(date, "MMM d");
    return `${dayCode} - ${dateStr}`;
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
        <ScheduleHeader title="Class Schedule" date={format(currentDate, "EEEE, MMMM d, yyyy")} />
        
        <Tabs defaultValue="today" className="w-full" onValueChange={handleViewChange}>
          <TabsList className={`w-full ${isMobile ? 'grid grid-cols-3' : 'flex'} md:w-auto bg-gray-100 mb-4 rounded-xl p-1`}>
            <TabsTrigger value="today" className="flex items-center gap-1.5 rounded-lg">
              <ListChecks className="h-4 w-4" />
              <span>{isMobile ? "Today" : "Today's Schedule"}</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-1.5 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span>{isMobile ? "Week" : "Weekly Overview"}</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1.5 rounded-lg">
              <CalendarDays className="h-4 w-4" />
              <span>{isMobile ? "All" : "All Reminders"}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-0">
            <div className="p-4 bg-teacher-lightBlue rounded-lg border mb-4">
              <h2 className="text-lg font-medium mb-2">Today's Schedule</h2>
              <p className="text-sm text-gray-600">
                {format(currentDate, "EEEE, MMMM d")} - View all your periods and reminders for today.
              </p>
            </div>
            
            <div className="space-y-3">
              {schoolSetup?.periods
                .filter(period => {
                  const todayCode = getCurrentDayCode();
                  // This is a simplified check - in a real app, we'd check the period's schedule
                  return todayCode !== null;
                })
                .map(period => {
                  const scheduleForToday = period.schedules?.find(s => s.dayOfWeek === getCurrentDayCode());
                  const startTime = scheduleForToday?.startTime || "";
                  const endTime = scheduleForToday?.endTime || "";
                  
                  const periodReminders = reminders.filter(r => 
                    r.periodId === period.id && 
                    r.days.includes(getCurrentDayCode() as any) &&
                    !r.completed
                  );
                  
                  return (
                    <div key={period.id} className="p-4 bg-white rounded-lg border hover:border-teacher-blue transition-colors shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {period.name}
                            {period.isPrepPeriod && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Prep
                              </span>
                            )}
                          </h3>
                          <div className="text-xs text-gray-500 mt-1">
                            {startTime} - {endTime}
                          </div>
                        </div>
                      </div>
                      
                      {periodReminders.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          <h4 className="text-xs font-medium text-gray-500">Reminders:</h4>
                          {periodReminders.map(reminder => (
                            <div 
                              key={reminder.id} 
                              className="flex items-start gap-2 p-2 bg-gray-50 rounded-md"
                            >
                              <div>
                                <div className="text-sm font-medium">{reminder.title}</div>
                                {reminder.notes && (
                                  <div className="text-xs text-gray-500 mt-1">{reminder.notes}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-gray-400">No reminders for this period</div>
                      )}
                    </div>
                  );
                })}
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="mt-0">
            <div className="p-4 bg-teacher-lightIndigo rounded-lg border mb-4">
              <h2 className="text-lg font-medium mb-2">Weekly Overview</h2>
              <p className="text-sm text-gray-600">
                Week of {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d")} to {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 4), "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <div className={`${isMobile ? 'min-w-[600px]' : 'min-w-[800px]'}`}>
                <div className="grid grid-cols-6 border rounded-t-lg overflow-hidden">
                  <div className="p-3 font-medium text-sm text-center bg-gray-50 border-r">
                    Period
                  </div>
                  {weekDays().map(day => (
                    <div key={format(day, 'yyyy-MM-dd')} className="p-3 font-medium text-sm text-center bg-gray-50 border-r last:border-r-0">
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
                    </div>
                  ))}
                </div>
                
                {schoolSetup?.periods.map((period, index) => (
                  <div 
                    key={period.id} 
                    className={`grid grid-cols-6 border-b border-x last:rounded-b-lg ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <div className="p-3 border-r text-sm">
                      <div className="font-medium flex items-center gap-1">
                        {period.name}
                        {period.isPrepPeriod && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Prep
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {period.schedules?.[0]?.startTime || ""} - {period.schedules?.[0]?.endTime || ""}
                      </div>
                    </div>
                    
                    {weekDays().map(day => {
                      const dayCode = getDayCodeFromDate(day) as any;
                      const dayReminders = reminders.filter(r => 
                        r.periodId === period.id && 
                        r.days.includes(dayCode) &&
                        !r.completed
                      );
                      
                      return (
                        <div key={`${period.id}-${format(day, 'yyyy-MM-dd')}`} className="p-3 border-r last:border-r-0">
                          {dayReminders.length > 0 ? (
                            <div className="space-y-1">
                              {dayReminders.map(reminder => (
                                <div key={reminder.id} className="text-xs p-1 bg-teacher-blue/10 rounded">
                                  {reminder.title}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                              -
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <ScheduleFilters 
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              schoolSetup={schoolSetup}
              currentDate={currentDate}
            />
            
            <div className="mt-3">
              <ReminderCardList 
                reminders={filteredReminders}
                schoolSetup={schoolSetup}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Schedule;
