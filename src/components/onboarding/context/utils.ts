import * as React from 'react';
import { OnboardingState } from './types';
import { checkForOverlaps } from './utils/overlap';
import { createOnboardingActions } from './utils/stateActions';
import { 
  handlePeriodNameChange, 
  handleScheduleStartTimeChange, 
  handleScheduleEndTimeChange, 
  applyScheduleToAllDays, 
  addPeriod, 
  removePeriod 
} from './utils/periodOperations';
import { 
  toggleCustomScheduleVisibility, 
  toggleCustomSchedule, 
  hasCustomSchedule 
} from './utils/scheduleOperations';
import { 
  updateTermNameFromType, 
  toggleDay 
} from './utils/dayOperations';
import { 
  addCategory, 
  updateCategory, 
  removeCategory 
} from './utils/categoryOperations';
import { getInitialOnboardingState } from './utils/initialState';

export { getInitialOnboardingState };

export const createOnboardingUtilityMethods = (
  state: OnboardingState,
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
) => {
  const { periods, selectedDays, categories } = state;
  
  return {
    updateTermNameFromType: (type) => updateTermNameFromType(setState, type),
    toggleDay: (day) => toggleDay(selectedDays, periods, setState, day),
    handlePeriodNameChange: (id, name) => handlePeriodNameChange(periods, setState, id, name),
    handleScheduleStartTimeChange: (periodId, day, time) => 
      handleScheduleStartTimeChange(periods, setState, periodId, day, time),
    handleScheduleEndTimeChange: (periodId, day, time) => 
      handleScheduleEndTimeChange(periods, setState, periodId, day, time),
    applyScheduleToAllDays: (periodId, sourceDayOfWeek) => 
      applyScheduleToAllDays(periods, setState, periodId, sourceDayOfWeek),
    addPeriod: () => addPeriod(periods, selectedDays, setState),
    removePeriod: (id) => removePeriod(periods, setState, id),
    toggleCustomScheduleVisibility: (periodId) => toggleCustomScheduleVisibility(setState, periodId),
    toggleCustomSchedule: (periodId, day, isCustom) => 
      toggleCustomSchedule(periods, setState, periodId, day, isCustom),
    hasCustomSchedule: (periodId, day) => hasCustomSchedule(periods, periodId, day),
    addCategory: () => addCategory(setState),
    updateCategory: (index, value) => updateCategory(categories, setState, index, value),
    removeCategory: (index) => removeCategory(categories, setState, index)
  };
};
