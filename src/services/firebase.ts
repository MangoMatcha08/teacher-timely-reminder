
import { firestore, auth, googleProvider } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, signInWithPopup } from "firebase/auth";
import { Reminder, SchoolSetup } from "@/context/ReminderContext";

// Authentication functions
export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registration successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Register error:", error);
    
    // Provide more specific error messages
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
    
    // Provide more specific error messages
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
  // Generate a unique ID for the test user
  const testUserId = "test-user-" + Date.now().toString();
  
  // Create a mock user object that mimics Firebase User
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
  
  // Setup default school setup for test user
  await saveSchoolSetup(testUserId, {
    schoolName: "Demo High School",
    role: "Teacher",
    subjects: ["Math", "Science", "English", "History"],
    classPeriods: ["Period 1", "Period 2", "Period 3", "Period 4"],
    categories: ["Homework", "Exam", "Project", "Meeting", "Other"],
    gradeLevels: ["9th Grade", "10th Grade", "11th Grade", "12th Grade"],
  });
  
  // Create a few sample reminders for the test account
  const sampleReminders = [
    {
      title: "Collect Math Homework",
      description: "Collect homework from Period 1",
      date: new Date(),
      time: "09:00",
      category: "Homework",
      priority: "Medium",
      completed: false,
      period: "Period 1",
      subject: "Math",
      type: "Prepare Materials",
    },
    {
      title: "Science Project Due",
      description: "Final project presentations",
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: "13:30",
      category: "Project",
      priority: "High",
      completed: false,
      period: "Period 3",
      subject: "Science",
      type: "Grade",
    },
    {
      title: "Parent Conference",
      description: "Meeting with Alex's parents",
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      time: "15:00",
      category: "Meeting",
      priority: "High",
      completed: false,
      period: "After School",
      subject: "English",
      type: "Call Home",
    },
  ];
  
  // Add sample reminders
  for (const reminder of sampleReminders) {
    await saveReminder(reminder, testUserId);
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
