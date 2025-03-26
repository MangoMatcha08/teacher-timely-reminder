
import * as React from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { OnboardingState } from '../types';

export const toggleCustomScheduleVisibility = (
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  periodId: string
) => {
  setState(prev => ({
    ...prev,
    customScheduleVisibility: {
      ...prev.customScheduleVisibility,
      [periodId]: !prev.customScheduleVisibility[periodId]
    }
  }));
};

export const toggleCustomSchedule = (
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  periodId: string, 
  day: DayOfWeek, 
  isCustom: boolean
) => {
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

export const hasCustomSchedule = (
  periods: Period[],
  periodId: string, 
  day: DayOfWeek
): boolean => {
  const period = periods.find(p => p.id === periodId);
  if (!period || period.schedules.length <= 1) return false;
  
  const schedule = period.schedules.find(s => s.dayOfWeek === day);
  if (!schedule) return false;
  
  const otherSchedule = period.schedules.find(s => s.dayOfWeek !== day);
  if (!otherSchedule) return false;
  
  return schedule.startTime !== otherSchedule.startTime || 
         schedule.endTime !== otherSchedule.endTime;
};
