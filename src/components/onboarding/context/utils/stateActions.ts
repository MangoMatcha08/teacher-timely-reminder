
import * as React from 'react';
import { OnboardingState, TermType } from '../types';
import { DayOfWeek, Period } from "@/context/ReminderContext";

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
