
import React, { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  offlineMode: boolean;
  setCompletedOnboarding: () => true;
  resetOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  loginWithTestAccount: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
