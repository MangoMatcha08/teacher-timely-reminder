
import { User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  setCompletedOnboarding: () => true;
  resetOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  loginWithTestAccount: () => Promise<any>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
