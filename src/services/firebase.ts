
import { firestore, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Reminder, SchoolSetup } from "@/context/ReminderContext";

// Authentication functions
export const register = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
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
