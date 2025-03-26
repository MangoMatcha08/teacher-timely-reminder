
import { OnboardingState } from '../types';

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
