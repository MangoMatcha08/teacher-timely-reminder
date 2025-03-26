
import { auth, firestore } from "@/lib/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { Reminder, SchoolSetup, Period, Term, DayOfWeek } from "@/context/ReminderContext";

// Sample data for testing
const samplePeriods: Period[] = [
  {
    id: "period-1",
    name: "Period 1",
    schedules: [
      { dayOfWeek: "M", startTime: "8:00 AM", endTime: "8:50 AM" },
      { dayOfWeek: "T", startTime: "8:00 AM", endTime: "8:50 AM" },
      { dayOfWeek: "W", startTime: "8:00 AM", endTime: "8:50 AM" },
      { dayOfWeek: "Th", startTime: "8:00 AM", endTime: "8:50 AM" },
      { dayOfWeek: "F", startTime: "8:00 AM", endTime: "8:50 AM" }
    ]
  },
  {
    id: "period-2",
    name: "Period 2",
    schedules: [
      { dayOfWeek: "M", startTime: "9:00 AM", endTime: "9:50 AM" },
      { dayOfWeek: "T", startTime: "9:00 AM", endTime: "9:50 AM" },
      { dayOfWeek: "W", startTime: "9:00 AM", endTime: "9:50 AM" },
      { dayOfWeek: "Th", startTime: "9:00 AM", endTime: "9:50 AM" },
      { dayOfWeek: "F", startTime: "9:00 AM", endTime: "9:50 AM" }
    ]
  },
  {
    id: "period-3",
    name: "Period 3",
    schedules: [
      { dayOfWeek: "M", startTime: "10:00 AM", endTime: "10:50 AM" },
      { dayOfWeek: "T", startTime: "10:00 AM", endTime: "10:50 AM" },
      { dayOfWeek: "W", startTime: "10:00 AM", endTime: "10:50 AM" },
      { dayOfWeek: "Th", startTime: "10:00 AM", endTime: "10:50 AM" },
      { dayOfWeek: "F", startTime: "10:00 AM", endTime: "10:50 AM" }
    ]
  }
];

const sampleTerm: Term = {
  id: "term-default",
  name: "Current Term",
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000 * 120).toISOString(),
  schoolYear: "2023-2024"
};

const sampleSchoolSetup: SchoolSetup = {
  termId: sampleTerm.id,
  terms: [sampleTerm],
  schoolDays: ["M", "T", "W", "Th", "F"] as DayOfWeek[],
  periods: samplePeriods,
  schoolHours: {
    startTime: "7:45 AM",
    endTime: "3:15 PM",
    teacherArrivalTime: "7:30 AM"
  },
  categories: [
    "Materials/Set up",
    "Student support",
    "School events",
    "Instruction",
    "Administrative tasks"
  ],
  iepMeetings: {
    enabled: false
  }
};

const sampleReminders: Reminder[] = [
  {
    id: "reminder-1",
    title: "Prepare Biology Lesson",
    notes: "Create slides and handouts for Period 1",
    category: "Instruction",
    priority: "High",
    completed: false,
    periodId: "period-1",
    type: "Prepare Materials",
    timing: "Before School",
    days: ["M", "W"] as DayOfWeek[],
    recurrence: "Weekly",
    termId: sampleTerm.id,
    createdAt: new Date()
  },
  {
    id: "reminder-2",
    title: "Staff Meeting",
    notes: "Weekly department meeting",
    category: "Administrative tasks",
    priority: "Medium",
    completed: false,
    periodId: "period-2",
    type: "Meeting",
    timing: "After School",
    days: ["T"] as DayOfWeek[],
    recurrence: "Weekly",
    termId: sampleTerm.id,
    createdAt: new Date()
  },
  {
    id: "reminder-3",
    title: "Grade Homework",
    notes: "Return by Friday",
    category: "Instruction",
    priority: "Medium",
    completed: false,
    periodId: "period-3",
    type: "Grade",
    timing: "During Period",
    days: ["Th"] as DayOfWeek[],
    recurrence: "Once",
    termId: sampleTerm.id,
    createdAt: new Date()
  }
];

/**
 * Loads test data into Firebase for preview and testing purposes
 */
export const loadTestDataToFirebase = async (userId: string): Promise<void> => {
  try {
    console.log("Starting to load test data to Firebase...");
    // Save school setup
    await setDoc(doc(firestore, "schoolSetup", userId), sampleSchoolSetup);
    console.log("School setup saved successfully");
    
    // Save reminders
    const reminderCollection = collection(firestore, "reminders");
    for (const reminder of sampleReminders) {
      await addDoc(reminderCollection, {
        ...reminder,
        userId,
        createdAt: new Date().toISOString(),
      });
    }
    console.log("Reminders saved successfully");
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error loading test data to Firebase:", error);
    return Promise.reject(error);
  }
};

/**
 * Verifies if test data is loaded in Firebase
 */
export const verifyFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple test to verify Firebase connection
    const testData = {
      timestamp: new Date().toISOString(),
      testId: Math.random().toString(36).substring(2, 9)
    };
    
    const testDoc = await addDoc(collection(firestore, "connectionTests"), testData);
    console.log("Firebase connection verified successfully with document ID:", testDoc.id);
    return true;
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return false;
  }
};
