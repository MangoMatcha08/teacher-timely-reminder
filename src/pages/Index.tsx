
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Calendar, CheckCircle, Clock, LucideBookOpen } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <header className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-teacher-blue sm:text-5xl md:text-6xl">
            Teacher Timely Reminder
          </h1>
          <p className="max-w-2xl mb-8 text-xl text-gray-600">
            The smart way for teachers to stay organized and never miss important tasks
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <>
                <Button asChild size="lg" className="bg-teacher-blue hover:bg-blue-600">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth?signup=true">Create Account</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="bg-teacher-blue hover:bg-blue-600">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        </header>

        <section className="py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 mb-2 bg-teacher-lightBlue rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teacher-blue" />
                </div>
                <CardTitle>Smart Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create and manage reminders tailored for your teaching schedule
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 mb-2 bg-teacher-lightGreen rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teacher-teal" />
                </div>
                <CardTitle>Class Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Integrate with your teaching schedule to organize tasks by class period
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 mb-2 bg-teacher-lightIndigo rounded-full flex items-center justify-center">
                  <LucideBookOpen className="w-6 h-6 text-teacher-indigo" />
                </div>
                <CardTitle>Template Library</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access and share reminder templates with other teachers
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-teacher-darkGray" />
                </div>
                <CardTitle>Works Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use as a Progressive Web App that works even without internet
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">
            Designed by teachers, for teachers
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-lg text-gray-600">
            Teacher Timely Reminder helps you manage your classroom schedule, student reminders,
            and administrative tasks - all in one place.
          </p>
          {!user && (
            <Button asChild size="lg" className="bg-teacher-teal hover:bg-teal-600">
              <Link to="/auth">Get Started Today</Link>
            </Button>
          )}
        </section>

        <footer className="py-8 mt-12 text-center text-gray-500 border-t">
          <p>© 2023-2024 Teacher Timely Reminder. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
