
import React, { createContext, useContext, useState } from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { createInitialSchedule, generateProgressivePeriodTimes, doPeriodsOverlap, TermType } from './OnboardingUtils';
import { toast } from "sonner";

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  schoolYear: string;
  setSchoolYear: (year: string) => void;
  termType: TermType;
  setTermType: (type: TermType) => void;
  termName: string;
  setTermName: (name: string) => void;
  selectedDays: DayOfWeek[];
  setSelectedDays: (days: DayOfWeek[]) => void;
  periods: Period[];
  setPeriods: (periods: Period[]) => void;
  customScheduleVisibility: Record<string, boolean>;
  setCustomScheduleVisibility: (visibility: Record<string, boolean>) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
  schoolStart: string;
  setSchoolStart: (time: string) => void;
  schoolEnd: string;
  setSchoolEnd: (time: string) => void;
  teacherArrival: string;
  setTeacherArrival: (time: string) => void;
  iepMeetingsEnabled: boolean;
  setIepMeetingsEnabled: (enabled: boolean) => void;
  iepBeforeSchool: boolean;
  setIepBeforeSchool: (enabled: boolean) => void;
  iepBeforeSchoolTime: string;
  setIepBeforeSchoolTime: (time: string) => void;
  iepAfterSchool: boolean;
  setIepAfterSchool: (enabled: boolean) => void;
  iepAfterSchoolTime: string;
  setIepAfterSchoolTime: (time: string) => void;
  showExitConfirm: boolean;
  setShowExitConfirm: (show: boolean) => void;
  
  // Utility methods
  updateTermNameFromType: (type: TermType) => void;
  toggleDay: (day: DayOfWeek) => void;
  handlePeriodNameChange: (id: string, name: string) => void;
  handleScheduleStartTimeChange: (periodId: string, day: DayOfWeek, time: string) => void;
  handleScheduleEndTimeChange: (periodId: string, day: DayOfWeek, time: string) => void;
  applyScheduleToAllDays: (periodId: string, sourceDayOfWeek: DayOfWeek) => void;
  addPeriod: () => void;
  removePeriod: (id: string) => void;
  toggleCustomScheduleVisibility: (periodId: string) => void;
  toggleCustomSchedule: (periodId: string, day: DayOfWeek, isCustom: boolean) => void;
  hasCustomSchedule: (periodId: string, day: DayOfWeek) => boolean;
  addCategory: () => void;
  updateCategory: (index: number, value: string) => void;
  removeCategory: (index: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  
  const [schoolYear, setSchoolYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [termType, setTermType] = useState<TermType>("semester");
  const [termName, setTermName] = useState("Fall Semester");
  
  const [schoolStart, setSchoolStart] = useState("8:00 AM");
  const [schoolEnd, setSchoolEnd] = useState("3:00 PM");
  const [teacherArrival, setTeacherArrival] = useState("7:30 AM");
  
  const [iepMeetingsEnabled, setIepMeetingsEnabled] = useState(false);
  const [iepBeforeSchool, setIepBeforeSchool] = useState(false);
  const [iepBeforeSchoolTime, setIepBeforeSchoolTime] = useState("7:00 AM");
  const [iepAfterSchool, setIepAfterSchool] = useState(false);
  const [iepAfterSchoolTime, setIepAfterSchoolTime] = useState("3:30 PM");
  
  const [categories, setCategories] = useState([
    "Materials/Set up",
    "Student support",
    "School events",
    "Instruction",
    "Administrative tasks"
  ]);
  
  const [customScheduleVisibility, setCustomScheduleVisibility] = useState<Record<string, boolean>>({});
  
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const defaultPeriod1 = generateProgressivePeriodTimes(0);
  const defaultPeriod2 = generateProgressivePeriodTimes(1);
  
  const [periods, setPeriods] = useState<Period[]>([
    { 
      id: "period-1", 
      name: "Period 1", 
      schedules: [] 
    },
    { 
      id: "period-2", 
      name: "Period 2", 
      schedules: [] 
    },
  ]);
  
  const updateTermNameFromType = (type: TermType) => {
    if (type === 'quarter') {
      setTermName('Quarter 1');
    } else if (type === 'semester') {
      setTermName('Fall Semester');
    } else {
      setTermName('Full Year');
    }
  };
  
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
      
      setPeriods(periods.map(period => ({
        ...period,
        schedules: period.schedules.filter(s => s.dayOfWeek !== day)
      })));
    } else {
      setSelectedDays([...selectedDays, day]);
      
      setPeriods(periods.map((period, index) => {
        const defaultTimes = generateProgressivePeriodTimes(index);
        
        if (period.schedules.length > 0) {
          const defaultSchedule = period.schedules[0];
          return {
            ...period,
            schedules: [
              ...period.schedules,
              {
                dayOfWeek: day,
                startTime: defaultSchedule ? defaultSchedule.startTime : defaultTimes.startTime,
                endTime: defaultSchedule ? defaultSchedule.endTime : defaultTimes.endTime
              }
            ]
          };
        } else {
          return {
            ...period,
            schedules: [{
              dayOfWeek: day,
              startTime: defaultTimes.startTime,
              endTime: defaultTimes.endTime
            }]
          };
        }
      }));
    }
  };
  
  const handlePeriodNameChange = (id: string, rawName: string) => {
    let formattedName = rawName;
    if (!rawName.toLowerCase().startsWith("period")) {
      const numberMatch = rawName.match(/\d+/);
      if (numberMatch) {
        formattedName = `Period ${numberMatch[0]}`;
      } else {
        formattedName = `Period ${rawName}`;
      }
    }
    
    setPeriods(periods.map((p) => (p.id === id ? { ...p, name: formattedName } : p)));
  };
  
  const handleScheduleStartTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    setPeriods(periods.map(period => {
      if (period.id !== periodId) return period;
      
      const scheduleIndex = period.schedules.findIndex(s => s.dayOfWeek === day);
      
      if (scheduleIndex === -1) {
        return period;
      } else {
        const updatedSchedules = [...period.schedules];
        updatedSchedules[scheduleIndex] = {
          ...updatedSchedules[scheduleIndex],
          startTime: time
        };
        
        const periodWithNewTime = {
          ...period,
          schedules: updatedSchedules
        };
        
        if (checkForOverlaps(periodWithNewTime, periods, day)) {
          toast.error(`This time overlaps with another period on ${day}`);
          return period;
        }
        
        return {
          ...period,
          schedules: updatedSchedules
        };
      }
    }));
  };
  
  const handleScheduleEndTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    setPeriods(periods.map(period => {
      if (period.id !== periodId) return period;
      
      const scheduleIndex = period.schedules.findIndex(s => s.dayOfWeek === day);
      
      if (scheduleIndex === -1) {
        return period;
      } else {
        const updatedSchedules = [...period.schedules];
        updatedSchedules[scheduleIndex] = {
          ...updatedSchedules[scheduleIndex],
          endTime: time
        };
        
        const periodWithNewTime = {
          ...period,
          schedules: updatedSchedules
        };
        
        if (checkForOverlaps(periodWithNewTime, periods, day)) {
          toast.error(`This time overlaps with another period on ${day}`);
          return period;
        }
        
        return {
          ...period,
          schedules: updatedSchedules
        };
      }
    }));
  };
  
  const checkForOverlaps = (periodToCheck: Period, allPeriods: Period[], day: DayOfWeek): boolean => {
    const scheduleToCheck = periodToCheck.schedules.find(s => s.dayOfWeek === day);
    if (!scheduleToCheck) return false;
    
    for (const otherPeriod of allPeriods) {
      if (otherPeriod.id === periodToCheck.id) continue;
      
      const otherSchedule = otherPeriod.schedules.find(s => s.dayOfWeek === day);
      if (!otherSchedule) continue;
      
      if (doPeriodsOverlap(
        scheduleToCheck.startTime,
        scheduleToCheck.endTime,
        otherSchedule.startTime,
        otherSchedule.endTime
      )) {
        return true;
      }
    }
    
    return false;
  };
  
  const applyScheduleToAllDays = (periodId: string, sourceDayOfWeek: DayOfWeek) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;
    
    const sourceSchedule = period.schedules.find(s => s.dayOfWeek === sourceDayOfWeek);
    if (!sourceSchedule) return;
    
    setPeriods(periods.map(p => {
      if (p.id !== periodId) return p;
      
      const updatedSchedules = p.schedules.map(schedule => {
        if (schedule.dayOfWeek === sourceDayOfWeek) {
          return schedule;
        } else {
          return {
            ...schedule,
            startTime: sourceSchedule.startTime,
            endTime: sourceSchedule.endTime
          };
        }
      });
      
      return {
        ...p,
        schedules: updatedSchedules
      };
    }));
  };
  
  const addPeriod = () => {
    const newIndex = periods.length;
    const newId = `period-${newIndex + 1}`;
    const defaultTimes = generateProgressivePeriodTimes(newIndex);
    
    const newPeriod: Period = {
      id: newId,
      name: `Period ${newIndex + 1}`,
      schedules: []
    };
    
    if (selectedDays.length > 0) {
      newPeriod.schedules = selectedDays.map(day => ({
        dayOfWeek: day,
        startTime: defaultTimes.startTime,
        endTime: defaultTimes.endTime
      }));
    }
    
    setPeriods([...periods, newPeriod]);
  };
  
  const removePeriod = (id: string) => {
    if (periods.length > 1) {
      setPeriods(periods.filter((p) => p.id !== id));
    }
  };
  
  const toggleCustomScheduleVisibility = (periodId: string) => {
    setCustomScheduleVisibility(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };
  
  const toggleCustomSchedule = (periodId: string, day: DayOfWeek, isCustom: boolean) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;
    
    if (isCustom) {
      return;
    } else {
      const firstDay = period.schedules.find(s => s.dayOfWeek !== day)?.dayOfWeek;
      if (!firstDay) return;
      
      const templateSchedule = period.schedules.find(s => s.dayOfWeek === firstDay);
      if (!templateSchedule) return;
      
      setPeriods(periods.map(p => {
        if (p.id !== periodId) return p;
        
        const updatedSchedules = p.schedules.map(s => {
          if (s.dayOfWeek === day) {
            return {
              ...s,
              startTime: templateSchedule.startTime,
              endTime: templateSchedule.endTime
            };
          }
          return s;
        });
        
        return {
          ...p,
          schedules: updatedSchedules
        };
      }));
    }
  };
  
  const hasCustomSchedule = (periodId: string, day: DayOfWeek): boolean => {
    const period = periods.find(p => p.id === periodId);
    if (!period || period.schedules.length <= 1) return false;
    
    const schedule = period.schedules.find(s => s.dayOfWeek === day);
    if (!schedule) return false;
    
    const otherSchedule = period.schedules.find(s => s.dayOfWeek !== day);
    if (!otherSchedule) return false;
    
    return schedule.startTime !== otherSchedule.startTime || 
           schedule.endTime !== otherSchedule.endTime;
  };
  
  const addCategory = () => {
    setCategories([...categories, `Category ${categories.length + 1}`]);
  };
  
  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };
  
  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };
  
  const value: OnboardingContextType = {
    currentStep,
    setCurrentStep,
    schoolYear,
    setSchoolYear,
    termType,
    setTermType,
    termName,
    setTermName,
    selectedDays,
    setSelectedDays,
    periods,
    setPeriods,
    customScheduleVisibility,
    setCustomScheduleVisibility,
    categories,
    setCategories,
    schoolStart,
    setSchoolStart,
    schoolEnd,
    setSchoolEnd,
    teacherArrival,
    setTeacherArrival,
    iepMeetingsEnabled,
    setIepMeetingsEnabled,
    iepBeforeSchool,
    setIepBeforeSchool,
    iepBeforeSchoolTime,
    setIepBeforeSchoolTime,
    iepAfterSchool,
    setIepAfterSchool,
    iepAfterSchoolTime,
    setIepAfterSchoolTime,
    showExitConfirm,
    setShowExitConfirm,
    
    updateTermNameFromType,
    toggleDay,
    handlePeriodNameChange,
    handleScheduleStartTimeChange,
    handleScheduleEndTimeChange,
    applyScheduleToAllDays,
    addPeriod,
    removePeriod,
    toggleCustomScheduleVisibility,
    toggleCustomSchedule,
    hasCustomSchedule,
    addCategory,
    updateCategory,
    removeCategory
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
