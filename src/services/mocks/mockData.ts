
import { Reminder, SchoolSetup, DayOfWeek, ReminderType, ReminderTiming, ReminderPriority, RecurrencePattern } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Function to generate mock reminders for testing
export const getMockReminders = (): Reminder[] => {
  return [
    {
      id: "reminder-1",
      userId: "user-1",
      title: "Call parent about Johnny's progress",
      description: "Discuss recent improvements in class participation",
      periodId: "period-1",
      timing: ReminderTiming.BeforeClass,
      type: ReminderType.CallHome,
      priority: ReminderPriority.High,
      category: "Parent Communication",
      completed: false,
      recurrence: RecurrencePattern.None,
      days: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "reminder-2",
      userId: "user-1",
      title: "Prepare lab materials for chemistry experiment",
      description: "Set up for sulfuric acid demonstration",
      periodId: "period-2",
      timing: ReminderTiming.BeforeClass,
      type: ReminderType.PrepareMaterials,
      priority: ReminderPriority.Medium,
      category: "Class Preparation",
      completed: true,
      recurrence: RecurrencePattern.None,
      days: [DayOfWeek.Tuesday, DayOfWeek.Thursday],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "reminder-3",
      userId: "user-1",
      title: "Grade midterm papers",
      description: "Focus on essay portion first",
      periodId: "period-3",
      timing: ReminderTiming.AfterClass,
      type: ReminderType.Grade,
      priority: ReminderPriority.Medium,
      category: "Grading",
      completed: false,
      recurrence: RecurrencePattern.None,
      days: [DayOfWeek.Wednesday],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "reminder-4",
      userId: "user-1",
      title: "Submit attendance reports",
      description: "Complete for all classes",
      periodId: "period-4",
      timing: ReminderTiming.AfterSchool,
      type: ReminderType.Other,
      priority: ReminderPriority.Low,
      category: "Administrative",
      completed: false,
      recurrence: RecurrencePattern.Daily,
      days: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// Function to generate a mock school setup for testing
export const getMockSchoolSetup = (): SchoolSetup => {
  const periods = [
    {
      id: "period-1",
      name: "Period 1",
      startTime: "8:00 AM",
      endTime: "9:00 AM",
      subject: "Math",
      location: "Room 101",
      schedules: [
        {
          dayOfWeek: DayOfWeek.Monday,
          startTime: "8:00 AM",
          endTime: "9:00 AM"
        },
        {
          dayOfWeek: DayOfWeek.Tuesday,
          startTime: "8:00 AM",
          endTime: "9:00 AM"
        },
        {
          dayOfWeek: DayOfWeek.Wednesday,
          startTime: "8:00 AM",
          endTime: "9:00 AM"
        },
        {
          dayOfWeek: DayOfWeek.Thursday,
          startTime: "8:00 AM",
          endTime: "9:00 AM"
        },
        {
          dayOfWeek: DayOfWeek.Friday,
          startTime: "8:00 AM",
          endTime: "9:00 AM"
        }
      ]
    },
    {
      id: "period-2",
      name: "Period 2",
      startTime: "9:10 AM",
      endTime: "10:10 AM",
      subject: "English",
      location: "Room 102",
      schedules: [
        {
          dayOfWeek: DayOfWeek.Monday,
          startTime: "9:10 AM",
          endTime: "10:10 AM"
        },
        {
          dayOfWeek: DayOfWeek.Tuesday,
          startTime: "9:10 AM",
          endTime: "10:10 AM"
        },
        {
          dayOfWeek: DayOfWeek.Wednesday,
          startTime: "9:10 AM",
          endTime: "10:10 AM"
        },
        {
          dayOfWeek: DayOfWeek.Thursday,
          startTime: "9:10 AM",
          endTime: "10:10 AM"
        },
        {
          dayOfWeek: DayOfWeek.Friday,
          startTime: "9:10 AM",
          endTime: "10:10 AM"
        }
      ]
    },
    {
      id: "period-3",
      name: "Period 3",
      startTime: "10:20 AM",
      endTime: "11:20 AM",
      subject: "Science",
      location: "Room 103",
      schedules: [
        {
          dayOfWeek: DayOfWeek.Monday,
          startTime: "10:20 AM",
          endTime: "11:20 AM"
        },
        {
          dayOfWeek: DayOfWeek.Tuesday,
          startTime: "10:20 AM",
          endTime: "11:20 AM"
        },
        {
          dayOfWeek: DayOfWeek.Wednesday,
          startTime: "10:20 AM",
          endTime: "11:20 AM"
        },
        {
          dayOfWeek: DayOfWeek.Thursday,
          startTime: "10:20 AM",
          endTime: "11:20 AM"
        },
        {
          dayOfWeek: DayOfWeek.Friday,
          startTime: "10:20 AM",
          endTime: "11:20 AM"
        }
      ]
    }
  ];
  
  return {
    id: "school-setup-1",
    userId: "user-1",
    schoolName: "Westfield High School",
    schoolYear: "2023-2024",
    terms: [
      {
        id: "term-1",
        name: "Fall Semester",
        startDate: "2023-08-15",
        endDate: "2023-12-20"
      },
      {
        id: "term-2",
        name: "Spring Semester",
        startDate: "2024-01-05",
        endDate: "2024-05-25"
      }
    ],
    periods,
    days: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
    categories: ["Lesson Planning", "Grading", "Parent Communication", "Administrative", "Professional Development"],
    notificationPreferences: {
      email: {
        enabled: true,
        address: "teacher@example.com",
        minPriority: ReminderPriority.Medium
      },
      push: {
        enabled: true,
        minPriority: ReminderPriority.High
      },
      text: {
        enabled: false,
        phoneNumber: "",
        minPriority: ReminderPriority.High
      }
    }
  };
};
