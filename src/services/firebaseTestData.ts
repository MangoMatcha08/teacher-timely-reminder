
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  getFirestore 
} from "firebase/firestore";
import { toast } from "sonner";

// Sample school setup data
const sampleSchoolSetup = {
  schoolYear: "2023-2024",
  termType: "semester",
  termName: "Fall Semester",
  selectedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  periods: [
    {
      id: "period-1",
      name: "Period 1",
      schedules: [
        { dayOfWeek: "Monday", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "Tuesday", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "Wednesday", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "Thursday", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "Friday", startTime: "8:00 AM", endTime: "8:50 AM" }
      ]
    },
    {
      id: "period-2",
      name: "Period 2",
      schedules: [
        { dayOfWeek: "Monday", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "Tuesday", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "Wednesday", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "Thursday", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "Friday", startTime: "9:00 AM", endTime: "9:50 AM" }
      ]
    }
  ],
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
  iepMeetingsEnabled: true,
  iepBeforeSchool: true,
  iepBeforeSchoolTime: "7:00 AM",
  iepAfterSchool: true,
  iepAfterSchoolTime: "3:30 PM"
};

// Sample reminders data
const sampleReminders = [
  {
    id: "reminder-1",
    title: "Prepare math worksheets",
    description: "Print worksheets for Period 1 math class",
    periodId: "period-1",
    category: "Materials/Set up",
    daysOfWeek: ["Monday", "Wednesday"],
    reminderTime: "7:45 AM",
    isActive: true,
    isComplete: false,
    lastCompleted: null
  },
  {
    id: "reminder-2",
    title: "Grade assignments",
    description: "Grade yesterday's assignments for Period 2",
    periodId: "period-2",
    category: "Administrative tasks",
    daysOfWeek: ["Tuesday", "Thursday"],
    reminderTime: "8:30 AM", 
    isActive: true,
    isComplete: false,
    lastCompleted: null
  },
  {
    id: "reminder-3",
    title: "Submit attendance",
    description: "Submit daily attendance report",
    periodId: null,
    category: "Administrative tasks",
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    reminderTime: "9:15 AM",
    isActive: true,
    isComplete: false,
    lastCompleted: null
  }
];

/**
 * Test if Firebase connection is working
 * @returns {Promise<boolean>} true if connection is successful
 */
export const verifyFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to get a collection reference and query it
    const db = getFirestore();
    const colRef = collection(db, "test");
    await getDocs(colRef);
    console.log("Firebase connection verified successfully");
    return true;
  } catch (error) {
    console.error("Firebase connection verification failed:", error);
    return false;
  }
};

/**
 * Load test data to Firebase for a specific user
 * @param {string} userId - User ID to associate with test data
 * @returns {Promise<void>}
 */
export const loadTestDataToFirebase = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to load test data");
  }
  
  try {
    const db = getFirestore();
    
    // Save school setup
    const schoolSetupRef = doc(db, "schoolSetup", userId);
    await setDoc(schoolSetupRef, sampleSchoolSetup);
    console.log("Sample school setup loaded");
    
    // Save reminders
    for (const reminder of sampleReminders) {
      const reminderRef = doc(db, `users/${userId}/reminders/${reminder.id}`);
      await setDoc(reminderRef, reminder);
    }
    console.log("Sample reminders loaded");
    
    toast.success("Test data loaded successfully!");
    return;
  } catch (error) {
    console.error("Error loading test data:", error);
    toast.error("Failed to load test data");
    throw error;
  }
};
