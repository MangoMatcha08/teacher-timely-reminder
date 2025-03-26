
import * as React from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { OnboardingState, TermType } from '../types';
import { generateProgressivePeriodTimes } from '../../OnboardingUtils';

export const updateTermNameFromType = (
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  type: TermType
) => {
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

export const toggleDay = (
  selectedDays: DayOfWeek[],
  periods: Period[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  day: DayOfWeek
) => {
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
