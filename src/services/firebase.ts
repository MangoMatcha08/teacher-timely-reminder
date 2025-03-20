import { firestore, auth, googleProvider } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, signInWithPopup } from "firebase/auth";
import { Reminder, SchoolSetup, DayOfWeek, ReminderType, ReminderTiming, Period, SchoolHours, Term } from "@/context/ReminderContext";

// Authentication functions
export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registration successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Register error:", error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please sign in instead.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Invalid email format. Please check your email address.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password is too weak. Please use a stronger password.");
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error.code?.includes('api-key')) {
      throw new Error("Authentication service is currently unavailable. Please try again later.");
    }
    
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("Invalid email or password. Please try again.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Invalid email format. Please check your email address.");
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("This account has been disabled. Please contact support.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many failed login attempts. Please try again later.");
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error.code?.includes('api-key')) {
      throw new Error("Authentication service is currently unavailable. Please try again later.");
    }
    
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw new Error("Failed to sign in with Google. Please try again.");
  }
};

// Simulated test account login for demo purposes
export const loginWithTestAccount = async () => {
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

  await saveSchoolSetup(testUserId, {
    termId: defaultTerm.id,
    terms: [defaultTerm],
    schoolDays: ["M", "T", "W", "Th", "F"],
    periods: defaultPeriods,
    schoolHours: schoolHours,
    categories: ["Materials/Set up", "Student support", "School events", "Instruction", "Administrative tasks"],
    iepMeetings: {
      enabled: false
    }
  });
  
  const sampleReminders: Partial<Reminder>[] = [
    {
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
      termId: defaultTerm.id
    },
    {
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
      termId: defaultTerm.id
    },
    {
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
      termId: defaultTerm.id
    },
  ];
  
  for (const reminder of sampleReminders) {
    await saveReminder(reminder as Reminder, testUserId);
  }
  
  return testUser;
};

export const logout = async () => {
  await signOut(auth);
};

// Firestore collections
const REMINDERS_COLLECTION = "reminders";
const SCHOOL_SETUP_COLLECTION = "schoolSetup";

// Reminders functions
export const saveReminder = async (reminder: Reminder, userId: string) => {
  try {
    const reminderRef = collection(firestore, REMINDERS_COLLECTION);
    await addDoc(reminderRef, {
      ...reminder,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw error;
  }
};

export const updateReminder = async (reminderId: string, reminderData: Partial<Reminder>) => {
  try {
    const reminderRef = doc(firestore, REMINDERS_COLLECTION, reminderId);
    await updateDoc(reminderRef, { ...reminderData });
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

export const deleteReminder = async (reminderId: string) => {
  try {
    const reminderRef = doc(firestore, REMINDERS_COLLECTION, reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
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
    throw error;
  }
};

// School setup functions
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup) => {
  try {
    const setupRef = doc(firestore, SCHOOL_SETUP_COLLECTION, userId);
    await setDoc(setupRef, { ...setup, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error saving school setup:", error);
    throw error;
  }
};

export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    const setupRef = doc(firestore, SCHOOL_SETUP_COLLECTION, userId);
    const docSnap = await getDoc(setupRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SchoolSetup;
    }
    return null;
  } catch (error) {
    console.error("Error getting school setup:", error);
    throw error;
  }
};
