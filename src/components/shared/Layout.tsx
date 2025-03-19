
import React from "react";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Calendar, Settings, Menu, X } from "lucide-react";
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
  const isMobile = useIsMobile();
  const { completedTasks, totalTasks } = useReminders();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <CheckCircle className="h-6 w-6 text-teacher-blue" />
              <span className="text-xl font-semibold ml-2 text-gray-900">
                Teacher Reminder
              </span>
            </Link>
            {pageTitle && (
              <span className="ml-4 text-gray-500 hidden md:inline">/ {pageTitle}</span>
            )}
          </div>
          
          {isMobile ? (
            <button onClick={toggleMobileMenu} className="p-2">
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <MobileSync />
              
              <Link to="/dashboard">
                <Button variant="ghost" className="flex items-center">
                  <Home className="h-5 w-5 mr-1" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/schedule">
                <Button variant="ghost" className="flex items-center">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>Schedule</span>
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button variant="ghost" className="flex items-center">
                  <Settings className="h-5 w-5 mr-1" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 shadow-md py-2 animate-fade-in">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            <Link to="/dashboard" onClick={closeMobileMenu}>
              <Button variant="ghost" className="flex items-center w-full justify-start">
                <Home className="h-5 w-5 mr-2" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/schedule" onClick={closeMobileMenu}>
              <Button variant="ghost" className="flex items-center w-full justify-start">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Schedule</span>
              </Button>
            </Link>
            
            <Link to="/settings" onClick={closeMobileMenu}>
              <Button variant="ghost" className="flex items-center w-full justify-start">
                <Settings className="h-5 w-5 mr-2" />
                <span>Settings</span>
              </Button>
            </Link>
            
            <div className="pt-2 pb-1">
              <MobileSync />
            </div>
          </div>
        </div>
      )}
      
      {/* Task Progress Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Today's Progress:</div>
            <div className="text-sm font-medium">
              {completedTasks}/{totalTasks} tasks ({completionPercentage}%)
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className="bg-teacher-blue h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-sm border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Teacher Reminder App
        </div>
      </footer>
    </div>
  );
};

export default Layout;
