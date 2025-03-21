
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Schema for auth form validation
const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const AuthScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { login, register, loginWithGoogle, loginWithTestAccount, resetOnboarding, isOffline } = useAuth();
  const navigate = useNavigate();

  const { 
    register: registerForm, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      
      if (isLoginMode) {
        await login(data.email, data.password);
        navigate("/onboarding");
      } else {
        await register(data.email, data.password);
        navigate("/onboarding");
      }
    } catch (error) {
      // Error already displayed in toast from AuthContext
      console.error("Auth form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      // The redirect will happen automatically in Supabase OAuth
    } catch (error) {
      // Error already displayed in toast from AuthContext
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleverLogin = async () => {
    try {
      setIsLoading(true);
      // For now, just use the test account login
      await loginWithTestAccount();
      navigate("/dashboard");
    } catch (error) {
      console.error("Clever login error:", error);
      toast.error("Failed to sign in with Clever. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAccountLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithTestAccount();
      
      // Use a small delay to allow state to update
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Test account login error:", error);
      toast.error("Failed to sign in with test account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-teacher-gray/30">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Teacher Reminder</h1>
          <p className="text-muted-foreground">
            {isLoginMode ? "Sign in to manage your classroom reminders" : "Create an account to get started"}
          </p>
          {isOffline && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-700">
                Network connection issues detected. You can still sign in with a test account.
              </p>
            </div>
          )}
        </div>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="text-xl">{isLoginMode ? "Sign In" : "Create Account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  className={errors.email ? "border-destructive" : ""}
                  {...registerForm("email")}
                  disabled={isLoading || isOffline}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={errors.password ? "border-destructive" : ""}
                  {...registerForm("password")}
                  disabled={isLoading || isOffline}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                disabled={isOffline}
              >
                {isLoginMode ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-teacher-blue hover:underline text-sm"
                disabled={isOffline}
              >
                {isLoginMode 
                  ? "Don't have an account? Create one" 
                  : "Already have an account? Sign in"}
              </button>
            </div>

            {isLoginMode && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isOffline}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCleverLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#0C80DF" />
                      <path d="M12 6.75C9.13 6.75 6.75 9.13 6.75 12C6.75 14.87 9.13 17.25 12 17.25C14.87 17.25 17.25 14.87 17.25 12C17.25 9.13 14.87 6.75 12 6.75ZM12 15.75C9.93 15.75 8.25 14.07 8.25 12C8.25 9.93 9.93 8.25 12 8.25C14.07 8.25 15.75 9.93 15.75 12C15.75 14.07 14.07 15.75 12 15.75Z" fill="white" />
                    </svg>
                    Sign in with Clever
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    onClick={handleTestAccountLogin}
                    disabled={isLoading}
                  >
                    Use Test Account
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-center text-sm text-muted-foreground">
              By {isLoginMode ? "signing in" : "creating an account"}, you agree to our Terms of Service and Privacy Policy.
            </p>
            <div className="border-t border-border pt-4 w-full">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={handleResetOnboarding}
              >
                Reset Onboarding Data (For Testing)
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthScreen;
