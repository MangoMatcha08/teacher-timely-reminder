import { firestore, auth, googleProvider } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, signInWithPopup } from "firebase/auth";
import { Reminder, SchoolSetup, DayOfWeek, ReminderType, ReminderTiming, Period, SchoolHours, Term } from "@/context/ReminderContext";
import { handleFirebaseError, ErrorType, AppError } from "@/utils/errorHandling";

// Authentication functions
export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registration successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Register error:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

// Simulated test account login for demo purposes
export const loginWithTestAccount = async () => {
  try {
    const testUserId = "test-user-" + Date.now().toString();
    
    const testUser = {
      uid: testUserId,
      email: "test@teacherreminder.app",
      displayName: "Test Teacher",
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      refreshToken: "test-refresh-token",
      tenantId: null,
      delete: () => Promise.resolve(),
      getIdToken: () => Promise.resolve("test-id-token"),
      getIdTokenResult: () => Promise.resolve({
        token: "test-id-token",
        signInProvider: "password",
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        issuedAtTime: new Date().toISOString(),
        claims: {}
      }),
      reload: () => Promise.resolve(),
      toJSON: () => ({})
    } as unknown as User;
    
    const defaultPeriods: Period[] = [
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
      },
      {
        id: "period-4",
        name: "Period 4",
        schedules: [
          { dayOfWeek: "M", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "T", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "W", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "Th", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "F", startTime: "11:00 AM", endTime: "11:50 AM" }
        ]
      }
    ];

    const defaultTerm: Term = {
      id: "term-default",
      name: "Current Term",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 120).toISOString(),
      schoolYear: "2023-2024"
    };

    const schoolHours: SchoolHours = {
      startTime: "7:45 AM",
      endTime: "3:15 PM",
      teacherArrivalTime: "7:30 AM"
    };

    // Create and save the school setup first
    const schoolSetup: SchoolSetup = {
      termId: defaultTerm.id,
      terms: [defaultTerm],
      schoolDays: ["M", "T", "W", "Th", "F"],
      periods: defaultPeriods,
      schoolHours: schoolHours,
      categories: ["Materials/Set up", "Student support", "School events", "Instruction", "Administrative tasks"],
      iepMeetings: {
        enabled: false
      }
    };
    
    // Store the school setup in local storage instead of trying to use Firestore
    localStorage.setItem(`schoolSetup_${testUserId}`, JSON.stringify(schoolSetup));
    
    // Create some sample reminders for the test account
    const sampleReminders: Reminder[] = [
      {
        id: "reminder-1",
        title: "Collect Math Homework",
        notes: "Collect homework from Period 1",
        category: "Materials/Set up",
        priority: "Medium",
        completed: false,
        periodId: "period-1",
        type: "Prepare Materials",
        timing: "During Period",
        days: ["M", "W", "F"],
        recurrence: "Weekly",
        termId: defaultTerm.id,
        createdAt: new Date()
      },
      {
        id: "reminder-2",
        title: "Science Project Due",
        notes: "Final project presentations",
        category: "Instruction",
        priority: "High",
        completed: false,
        periodId: "period-3",
        type: "Grade",
        timing: "End of Period",
        days: ["T"],
        recurrence: "Once",
        termId: defaultTerm.id,
        createdAt: new Date()
      },
      {
        id: "reminder-3",
        title: "Parent Conference",
        notes: "Meeting with Alex's parents",
        category: "Student support",
        priority: "High",
        completed: false,
        periodId: "period-4",
        type: "Call Home",
        timing: "After School",
        days: ["Th"],
        recurrence: "Once",
        termId: defaultTerm.id,
        createdAt: new Date()
      },
    ];
    
    // Store reminders in local storage instead of trying to use Firestore
    localStorage.setItem(`reminders_${testUserId}`, JSON.stringify(sampleReminders));
    
    // Return the test user
    return testUser;
  } catch (error) {
    console.error("Error creating test account:", error);
    throw {
      type: ErrorType.AUTHENTICATION,
      message: "Failed to create test account. Please try again."
    } as AppError;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

// Firestore collections
const REMINDERS_COLLECTION = "reminders";
const SCHOOL_SETUP_COLLECTION = "schoolSetup";

// Reminders functions
export const saveReminder = async (reminder: Reminder, userId: string) => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      // Get existing reminders from localStorage
      const existingRemindersStr = localStorage.getItem(`reminders_${userId}`);
      const existingReminders: Reminder[] = existingRemindersStr ? JSON.parse(existingRemindersStr) : [];
      
      // Add the new reminder with a generated ID
      const newReminder = {
        ...reminder,
        id: `reminder-${Date.now()}`,
        createdAt: new Date()
      };
      
      existingReminders.push(newReminder);
      
      // Save back to localStorage
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(existingReminders));
      return;
    }
    
    // Regular Firestore storage for non-test accounts
    const reminderRef = collection(firestore, REMINDERS_COLLECTION);
    await addDoc(reminderRef, {
      ...reminder,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving reminder:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

export const updateReminder = async (reminderId: string, reminderData: Partial<Reminder>) => {
  try {
    const reminderRef = doc(firestore, REMINDERS_COLLECTION, reminderId);
    await updateDoc(reminderRef, { ...reminderData });
  } catch (error) {
    console.error("Error updating reminder:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

export const deleteReminder = async (reminderId: string) => {
  try {
    const reminderRef = doc(firestore, REMINDERS_COLLECTION, reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error("Error deleting reminder:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      const remindersStr = localStorage.getItem(`reminders_${userId}`);
      return remindersStr ? JSON.parse(remindersStr) : [];
    }
    
    // Regular Firestore retrieval for non-test accounts
    const remindersRef = collection(firestore, REMINDERS_COLLECTION);
    const q = query(remindersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: new Date(data.createdAt)
      } as Reminder;
    });
  } catch (error) {
    console.error("Error getting reminders:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

// School setup functions
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup) => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      localStorage.setItem(`schoolSetup_${userId}`, JSON.stringify(setup));
      return;
    }
    
    // Regular Firestore storage for non-test accounts
    const setupRef = doc(firestore, SCHOOL_SETUP_COLLECTION, userId);
    await setDoc(setupRef, { ...setup, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error saving school setup:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};

export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      const setupStr = localStorage.getItem(`schoolSetup_${userId}`);
      return setupStr ? JSON.parse(setupStr) : null;
    }
    
    // Regular Firestore retrieval for non-test accounts
    const setupRef = doc(firestore, SCHOOL_SETUP_COLLECTION, userId);
    const docSnap = await getDoc(setupRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SchoolSetup;
    }
    return null;
  } catch (error) {
    console.error("Error getting school setup:", error);
    const appError = handleFirebaseError(error);
    throw appError;
  }
};
