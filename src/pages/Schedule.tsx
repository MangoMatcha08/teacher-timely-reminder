
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/shared/Layout";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/context/ReminderContext";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import ScheduleFilters from "@/components/schedule/ScheduleFilters";
import ReminderCardList from "@/components/schedule/ReminderCardList";

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
        <ScheduleHeader title="Class Schedule" />
        
        <ScheduleFilters 
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          schoolSetup={schoolSetup}
        />
        
        <div className="mt-3">
          <ReminderCardList 
            reminders={filteredReminders} 
            schoolSetup={schoolSetup} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
