
import React from "react";
import Button from "./Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home, Calendar, Settings, Menu, X, Plus, Bell, BarChart3, ListChecks } from "lucide-react";
import { useReminders } from "@/context/ReminderContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSync from "./MobileSync";

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { completedTasks, totalTasks } = useReminders();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-2 sticky top-0 z-40">
        <div className="container mx-auto px-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <CheckCircle className="h-5 w-5 text-teacher-blue" />
              <span className="text-lg font-semibold ml-1.5 text-gray-900">
                Teacher Reminder
              </span>
            </Link>
            {pageTitle && (
              <span className="ml-3 text-gray-500 text-sm hidden md:inline">/ {pageTitle}</span>
            )}
          </div>
          
          {isMobile ? (
            <div className="flex items-center gap-2">
              <Link to="/create-reminder" className="p-1.5">
                <Plus className="h-5 w-5 text-teacher-blue" />
              </Link>
              
              <button onClick={toggleMobileMenu} className="p-1.5">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <MobileSync />
              
              <Link to="/dashboard">
                <Button 
                  variant={isActivePath("/dashboard") ? "primary" : "ghost"} 
                  className={`flex items-center h-8 text-sm ${isActivePath("/dashboard") ? "bg-teacher-blue text-white" : ""}`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/schedule">
                <Button 
                  variant={isActivePath("/schedule") ? "primary" : "ghost"} 
                  className={`flex items-center h-8 text-sm ${isActivePath("/schedule") ? "bg-teacher-blue text-white" : ""}`}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Schedule</span>
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button 
                  variant={isActivePath("/settings") ? "primary" : "ghost"} 
                  className={`flex items-center h-8 text-sm ${isActivePath("/settings") ? "bg-teacher-blue text-white" : ""}`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  <span>Settings</span>
                </Button>
              </Link>
              
              <Link to="/create-reminder">
                <Button variant="primary" className="flex items-center h-8 text-sm ml-2">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add a Detailed Reminder</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 shadow-md py-1.5 animate-fade-in">
          <div className="container mx-auto px-3 flex flex-col space-y-1.5">
            <Link to="/dashboard" onClick={closeMobileMenu}>
              <Button 
                variant={isActivePath("/dashboard") ? "primary" : "ghost"}
                className={`flex items-center w-full justify-start h-8 text-sm ${isActivePath("/dashboard") ? "bg-teacher-blue text-white" : ""}`}
              >
                <Home className="h-4 w-4 mr-1.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/schedule" onClick={closeMobileMenu}>
              <Button 
                variant={isActivePath("/schedule") ? "primary" : "ghost"}
                className={`flex items-center w-full justify-start h-8 text-sm ${isActivePath("/schedule") ? "bg-teacher-blue text-white" : ""}`}
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Schedule</span>
              </Button>
            </Link>
            
            <Link to="/settings" onClick={closeMobileMenu}>
              <Button 
                variant={isActivePath("/settings") ? "primary" : "ghost"}
                className={`flex items-center w-full justify-start h-8 text-sm ${isActivePath("/settings") ? "bg-teacher-blue text-white" : ""}`}
              >
                <Settings className="h-4 w-4 mr-1.5" />
                <span>Settings</span>
              </Button>
            </Link>
            
            <Link to="/create-reminder" onClick={closeMobileMenu}>
              <Button 
                variant="primary" 
                className="flex items-center w-full justify-start h-8 text-sm mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add a Detailed Reminder</span>
              </Button>
            </Link>
            
            <div className="pt-1.5 pb-1">
              <MobileSync />
            </div>
          </div>
        </div>
      )}
      
      {/* Task Progress Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center">
              <Bell className="h-3 w-3 mr-1 text-teacher-blue" />
              Today's Progress:
            </div>
            <div className="text-xs font-medium flex items-center">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full">
                {completedTasks}/{totalTasks} tasks
              </span>
              <span className="ml-2 font-bold text-teacher-blue">
                {completionPercentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teacher-blue to-teacher-teal h-2 rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 py-4 pb-20 md:pb-4">
        {children}
      </main>
      
      {/* Mobile Navigation Tabs */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="grid grid-cols-3 h-16">
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center justify-center ${isActivePath("/dashboard") ? "text-teacher-blue" : "text-gray-500"}`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            
            <Link 
              to="/schedule" 
              className={`flex flex-col items-center justify-center ${isActivePath("/schedule") ? "text-teacher-blue" : "text-gray-500"}`}
            >
              <ListChecks className="h-5 w-5" />
              <span className="text-xs mt-1">Today's Tasks</span>
            </Link>
            
            <Link 
              to="/settings" 
              className={`flex flex-col items-center justify-center ${isActivePath("/settings") ? "text-teacher-blue" : "text-gray-500"}`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs mt-1">Progress</span>
            </Link>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white shadow-sm border-t border-gray-200 py-3 mt-auto hidden md:block">
        <div className="container mx-auto px-3 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Teacher Reminder App • Stay organized, teach better
        </div>
      </footer>
    </div>
  );
};

export default Layout;
