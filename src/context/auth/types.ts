
import { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  isOffline: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  loginWithTestAccount: () => Promise<User>;
  logout: () => Promise<void>;
  setCompleteOnboarding: () => void;
  resetOnboarding: () => void;
}
