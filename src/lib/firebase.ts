
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwCpl0yx_OfVZ4pXUcFkZxRV7tFJ8RNvM",
  authDomain: "teacher-reminder-app.firebaseapp.com",
  projectId: "teacher-reminder-app",
  storageBucket: "teacher-reminder-app.appspot.com",
  messagingSenderId: "860547177177",
  appId: "1:860547177177:web:5e51e02db6f1e5b7d29dba",
  measurementId: "G-BK3ZZ4J9FT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
