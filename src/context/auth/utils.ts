
import { toast } from "sonner";

// Helper function to manage test user onboarding state
export const manageTestUserOnboarding = (userId: string): boolean => {
  if (userId.startsWith("test-user-")) {
    const testUserOnboarding = localStorage.getItem("testUserOnboarding");
    return testUserOnboarding !== "reset";
  } else {
    const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding");
    return !!onboardingCompleted;
  }
};

// Create a test user for offline mode
export const createTestUser = (timestamp: number) => {
  const testUserId = `test-user-${timestamp}`;
  
  return {
    id: testUserId,
    email: `test${timestamp}@teacherreminder.app`,
    user_metadata: { name: "Test Teacher" },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    confirmation_sent_at: new Date().toISOString(),
    recovery_sent_at: null,
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString()
  } as User;
};
