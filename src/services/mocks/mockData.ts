
import { Reminder, SchoolSetup, DayOfWeek } from '@/context/ReminderContext';

// Create some mock reminders for when network is down
export const getMockReminders = (): Reminder[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: 'mock-1',
      title: 'Collect homework assignments',
      notes: 'Math homework from yesterday',
      category: 'Instruction',
      priority: 'High',
      completed: false,
      periodId: 'period-1',
      type: 'Prepare Materials',
      timing: 'During Period',
      days: ['M', 'W', 'F'],
      recurrence: 'Weekly',
      termId: 'term_default',
      dueDate: today.toISOString(),
      createdAt: new Date(),
      isPastDue: false
    },
    {
      id: 'mock-2',
      title: 'Grade quizzes',
      notes: 'Science quizzes from Monday',
      category: 'Grading',
      priority: 'Medium',
      completed: false,
      periodId: 'period-2',
      type: 'Grade',
      timing: 'After School',
      days: ['T', 'Th'],
      recurrence: 'Weekly',
      termId: 'term_default',
      dueDate: tomorrow.toISOString(),
      createdAt: new Date(),
      isPastDue: false
    },
    {
      id: 'mock-3',
      title: 'Faculty meeting',
      notes: 'Discuss curriculum changes',
      category: 'Meeting',
      priority: 'Low',
      completed: true,
      periodId: 'period-3',
      type: 'Other',
      timing: 'After School',
      days: ['W'],
      recurrence: 'Weekly',
      termId: 'term_default',
      dueDate: today.toISOString(),
      createdAt: new Date(),
      isPastDue: false
    }
  ];
};

// Create mock school setup for network failures
export const getMockSchoolSetup = (): SchoolSetup => {
  return {
    schoolDays: ["M", "T", "W", "Th", "F"],
    schoolHours: {
      startTime: "8:00 AM",
      endTime: "3:00 PM",
      teacherArrivalTime: "7:30 AM"
    },
    categories: [
      "Instruction",
      "Grading",
      "Meeting",
      "Communication",
      "Administration"
    ],
    periods: [
      {
        id: "period-1",
        name: "1st Period",
        schedules: [
          {
            dayOfWeek: "M",
            startTime: "8:00 AM",
            endTime: "8:50 AM"
          },
          {
            dayOfWeek: "T",
            startTime: "8:00 AM",
            endTime: "8:50 AM"
          },
          {
            dayOfWeek: "W",
            startTime: "8:00 AM",
            endTime: "8:30 AM"
          },
          {
            dayOfWeek: "Th",
            startTime: "8:00 AM",
            endTime: "8:50 AM"
          },
          {
            dayOfWeek: "F",
            startTime: "8:00 AM",
            endTime: "8:50 AM"
          }
        ],
        isPrepPeriod: false
      },
      {
        id: "period-2",
        name: "2nd Period",
        schedules: [
          {
            dayOfWeek: "M",
            startTime: "9:00 AM",
            endTime: "9:50 AM"
          },
          {
            dayOfWeek: "T",
            startTime: "9:00 AM",
            endTime: "9:50 AM"
          },
          {
            dayOfWeek: "W",
            startTime: "8:35 AM",
            endTime: "9:05 AM"
          },
          {
            dayOfWeek: "Th",
            startTime: "9:00 AM",
            endTime: "9:50 AM"
          },
          {
            dayOfWeek: "F",
            startTime: "9:00 AM",
            endTime: "9:50 AM"
          }
        ],
        isPrepPeriod: true
      },
      {
        id: "period-3",
        name: "3rd Period",
        schedules: [
          {
            dayOfWeek: "M",
            startTime: "10:00 AM",
            endTime: "10:50 AM"
          },
          {
            dayOfWeek: "T",
            startTime: "10:00 AM",
            endTime: "10:50 AM"
          },
          {
            dayOfWeek: "W",
            startTime: "9:10 AM",
            endTime: "9:40 AM"
          },
          {
            dayOfWeek: "Th",
            startTime: "10:00 AM",
            endTime: "10:50 AM"
          },
          {
            dayOfWeek: "F",
            startTime: "10:00 AM",
            endTime: "10:50 AM"
          }
        ],
        isPrepPeriod: false
      }
    ],
    termId: "term_default",
    terms: [
      {
        id: "term_default",
        name: "Current Term",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
        schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      }
    ]
  };
};
