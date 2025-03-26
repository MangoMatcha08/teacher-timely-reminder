
import * as React from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { OnboardingState, TermType } from './types';
import { toast } from "sonner";
import { doPeriodsOverlap, generateProgressivePeriodTimes } from '../OnboardingUtils';

export const checkForOverlaps = (periodToCheck: Period, allPeriods: Period[], day: DayOfWeek): boolean => {
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

export const createOnboardingActions = (
  state: OnboardingState,
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
) => {
  const setCurrentStep = (step: number) => 
    setState(prev => ({ ...prev, currentStep: step }));
    
  const setSchoolYear = (year: string) =>
    setState(prev => ({ ...prev, schoolYear: year }));
    
  const setTermType = (type: TermType) =>
    setState(prev => ({ ...prev, termType: type }));
    
  const setTermName = (name: string) =>
    setState(prev => ({ ...prev, termName: name }));
    
  const setSelectedDays = (days: DayOfWeek[]) =>
    setState(prev => ({ ...prev, selectedDays: days }));
    
  const setPeriods = (periods: Period[]) =>
    setState(prev => ({ ...prev, periods }));
    
  const setCustomScheduleVisibility = (visibility: Record<string, boolean>) =>
    setState(prev => ({ ...prev, customScheduleVisibility: visibility }));
    
  const setCategories = (categories: string[]) =>
    setState(prev => ({ ...prev, categories }));
    
  const setSchoolStart = (time: string) =>
    setState(prev => ({ ...prev, schoolStart: time }));
    
  const setSchoolEnd = (time: string) =>
    setState(prev => ({ ...prev, schoolEnd: time }));
    
  const setTeacherArrival = (time: string) =>
    setState(prev => ({ ...prev, teacherArrival: time }));
    
  const setIepMeetingsEnabled = (enabled: boolean) =>
    setState(prev => ({ ...prev, iepMeetingsEnabled: enabled }));
    
  const setIepBeforeSchool = (enabled: boolean) =>
    setState(prev => ({ ...prev, iepBeforeSchool: enabled }));
    
  const setIepBeforeSchoolTime = (time: string) =>
    setState(prev => ({ ...prev, iepBeforeSchoolTime: time }));
    
  const setIepAfterSchool = (enabled: boolean) =>
    setState(prev => ({ ...prev, iepAfterSchool: enabled }));
    
  const setIepAfterSchoolTime = (time: string) =>
    setState(prev => ({ ...prev, iepAfterSchoolTime: time }));
    
  const setShowExitConfirm = (show: boolean) =>
    setState(prev => ({ ...prev, showExitConfirm: show }));
  
  return {
    setCurrentStep,
    setSchoolYear,
    setTermType,
    setTermName,
    setSelectedDays,
    setPeriods,
    setCustomScheduleVisibility,
    setCategories,
    setSchoolStart,
    setSchoolEnd,
    setTeacherArrival,
    setIepMeetingsEnabled,
    setIepBeforeSchool,
    setIepBeforeSchoolTime,
    setIepAfterSchool,
    setIepAfterSchoolTime,
    setShowExitConfirm
  };
};

export const createOnboardingUtilityMethods = (
  state: OnboardingState,
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
) => {
  const { periods, selectedDays } = state;
  
  const updateTermNameFromType = (type: TermType) => {
    let newTermName = '';
    
    if (type === 'quarter') {
      newTermName = 'Quarter 1';
    } else if (type === 'semester') {
      newTermName = 'Fall Semester';
    } else {
      newTermName = 'Full Year';
    }
    
    setState(prev => ({ ...prev, termName: newTermName }));
  };
  
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      const newSelectedDays = selectedDays.filter((d) => d !== day);
      
      const newPeriods = periods.map(period => ({
        ...period,
        schedules: period.schedules.filter(s => s.dayOfWeek !== day)
      }));
      
      setState(prev => ({
        ...prev, 
        selectedDays: newSelectedDays,
        periods: newPeriods
      }));
    } else {
      const newSelectedDays = [...selectedDays, day];
      
      const newPeriods = periods.map((period, index) => {
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
      });
      
      setState(prev => ({
        ...prev,
        selectedDays: newSelectedDays,
        periods: newPeriods
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
    
    const newPeriods = periods.map((p) => 
      (p.id === id ? { ...p, name: formattedName } : p)
    );
    
    setState(prev => ({ ...prev, periods: newPeriods }));
  };
  
  const handleScheduleStartTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    const newPeriods = periods.map(period => {
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
    });
    
    setState(prev => ({ ...prev, periods: newPeriods }));
  };
  
  const handleScheduleEndTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    const newPeriods = periods.map(period => {
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
    });
    
    setState(prev => ({ ...prev, periods: newPeriods }));
  };
  
  const applyScheduleToAllDays = (periodId: string, sourceDayOfWeek: DayOfWeek) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;
    
    const sourceSchedule = period.schedules.find(s => s.dayOfWeek === sourceDayOfWeek);
    if (!sourceSchedule) return;
    
    const newPeriods = periods.map(p => {
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
    });
    
    setState(prev => ({ ...prev, periods: newPeriods }));
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
    
    setState(prev => ({
      ...prev,
      periods: [...prev.periods, newPeriod]
    }));
  };
  
  const removePeriod = (id: string) => {
    if (periods.length > 1) {
      setState(prev => ({
        ...prev,
        periods: prev.periods.filter((p) => p.id !== id)
      }));
    }
  };
  
  const toggleCustomScheduleVisibility = (periodId: string) => {
    setState(prev => ({
      ...prev,
      customScheduleVisibility: {
        ...prev.customScheduleVisibility,
        [periodId]: !prev.customScheduleVisibility[periodId]
      }
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
      
      const newPeriods = periods.map(p => {
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
      });
      
      setState(prev => ({ ...prev, periods: newPeriods }));
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
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, `Category ${prev.categories.length + 1}`]
    }));
  };
  
  const updateCategory = (index: number, value: string) => {
    const newCategories = [...state.categories];
    newCategories[index] = value;
    setState(prev => ({ ...prev, categories: newCategories }));
  };
  
  const removeCategory = (index: number) => {
    if (state.categories.length > 1) {
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      }));
    }
  };
  
  return {
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
};

export const getInitialOnboardingState = (): OnboardingState => {
  return {
    currentStep: 0,
    schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    termType: "semester",
    termName: "Fall Semester",
    selectedDays: [],
    periods: [
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
    ],
    customScheduleVisibility: {},
    categories: [
      "Materials/Set up",
      "Student support",
      "School events",
      "Instruction",
      "Administrative tasks"
    ],
    schoolStart: "8:00 AM",
    schoolEnd: "3:00 PM",
    teacherArrival: "7:30 AM",
    iepMeetingsEnabled: false,
    iepBeforeSchool: false,
    iepBeforeSchoolTime: "7:00 AM",
    iepAfterSchool: false,
    iepAfterSchoolTime: "3:30 PM",
    showExitConfirm: false
  };
};
