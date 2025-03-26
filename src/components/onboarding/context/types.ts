
import { DayOfWeek, Period } from "@/context/ReminderContext";

export type TermType = "quarter" | "semester" | "year";

export interface OnboardingState {
  currentStep: number;
  schoolYear: string;
  termType: TermType;
  termName: string;
  selectedDays: DayOfWeek[];
  periods: Period[];
  customScheduleVisibility: Record<string, boolean>;
  categories: string[];
  schoolStart: string;
  schoolEnd: string;
  teacherArrival: string;
  iepMeetingsEnabled: boolean;
  iepBeforeSchool: boolean;
  iepBeforeSchoolTime: string;
  iepAfterSchool: boolean;
  iepAfterSchoolTime: string;
  showExitConfirm: boolean;
}

export interface OnboardingActions {
  setCurrentStep: (step: number) => void;
  setSchoolYear: (year: string) => void;
  setTermType: (type: TermType) => void;
  setTermName: (name: string) => void;
  setSelectedDays: (days: DayOfWeek[]) => void;
  setPeriods: (periods: Period[]) => void;
  setCustomScheduleVisibility: (visibility: Record<string, boolean>) => void;
  setCategories: (categories: string[]) => void;
  setSchoolStart: (time: string) => void;
  setSchoolEnd: (time: string) => void;
  setTeacherArrival: (time: string) => void;
  setIepMeetingsEnabled: (enabled: boolean) => void;
  setIepBeforeSchool: (enabled: boolean) => void;
  setIepBeforeSchoolTime: (time: string) => void;
  setIepAfterSchool: (enabled: boolean) => void;
  setIepAfterSchoolTime: (time: string) => void;
  setShowExitConfirm: (show: boolean) => void;
}

export interface OnboardingUtilityMethods {
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

export type OnboardingContextType = OnboardingState & OnboardingActions & OnboardingUtilityMethods;
