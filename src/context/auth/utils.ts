import { User } from "@supabase/supabase-js";

export const createTestUser = (timestamp: number): User => {
  const userId = `test-user-${timestamp}`;
  return {
    id: userId,
    app_metadata: { provider: 'test' },
    user_metadata: { name: 'Test User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: `test${timestamp}@example.com`,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };
};

export const manageTestUserOnboarding = (userId: string): boolean => {
  if (userId.startsWith("test-user-")) {
    const onboardingStatus = localStorage.getItem("testUserOnboarding");
    return onboardingStatus === "completed";
  } else {
    return localStorage.getItem("hasCompletedOnboarding") === "true";
  }
};
