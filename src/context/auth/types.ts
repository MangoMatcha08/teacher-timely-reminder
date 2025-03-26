
import { User } from "firebase/auth";
import { SchoolSetup } from "../ReminderContext";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  setCompletedOnboarding: () => true;
  resetOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithTestAccount: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
