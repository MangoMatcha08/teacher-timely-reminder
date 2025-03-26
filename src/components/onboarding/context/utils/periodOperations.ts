
import * as React from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { OnboardingState } from '../types';
import { toast } from "sonner";
import { checkForOverlaps } from './overlap';
import { generateProgressivePeriodTimes } from '../../OnboardingUtils';

export const handlePeriodNameChange = (
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  id: string, 
  rawName: string
) => {
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

export const handleScheduleStartTimeChange = (
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  periodId: string, 
  day: DayOfWeek, 
  time: string
) => {
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

export const handleScheduleEndTimeChange = (
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  periodId: string, 
  day: DayOfWeek, 
  time: string
) => {
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

export const applyScheduleToAllDays = (
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  periodId: string, 
  sourceDayOfWeek: DayOfWeek
) => {
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

export const addPeriod = (
  periods: Period[],
  selectedDays: DayOfWeek[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
) => {
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

export const removePeriod = (
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  id: string
) => {
  if (periods.length > 1) {
    setState(prev => ({
      ...prev,
      periods: prev.periods.filter((p) => p.id !== id)
    }));
  }
};
