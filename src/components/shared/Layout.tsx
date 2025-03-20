
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
            <button onClick={toggleMobileMenu} className="p-1.5">
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <MobileSync />
              
              <Link to="/dashboard">
                <Button variant="ghost" className="flex items-center h-8 text-sm">
                  <Home className="h-4 w-4 mr-1" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/schedule">
                <Button variant="ghost" className="flex items-center h-8 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Schedule</span>
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button variant="ghost" className="flex items-center h-8 text-sm">
                  <Settings className="h-4 w-4 mr-1" />
                  <span>Settings</span>
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
              <Button variant="ghost" className="flex items-center w-full justify-start h-8 text-sm">
                <Home className="h-4 w-4 mr-1.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/schedule" onClick={closeMobileMenu}>
              <Button variant="ghost" className="flex items-center w-full justify-start h-8 text-sm">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Schedule</span>
              </Button>
            </Link>
            
            <Link to="/settings" onClick={closeMobileMenu}>
              <Button variant="ghost" className="flex items-center w-full justify-start h-8 text-sm">
                <Settings className="h-4 w-4 mr-1.5" />
                <span>Settings</span>
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
            <div className="text-xs text-muted-foreground">Today's Progress:</div>
            <div className="text-xs font-medium">
              {completedTasks}/{totalTasks} tasks ({completionPercentage}%)
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-teacher-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 py-4">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-sm border-t border-gray-200 py-3">
        <div className="container mx-auto px-3 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Teacher Reminder App
        </div>
      </footer>
    </div>
  );
};

export default Layout;
