
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  pageTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNav = true,
  pageTitle
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const navItems = [
    {
      name: "Today",
      path: "/dashboard",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && (
        <header className="border-b sticky top-0 z-10 bg-white">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/dashboard" className="font-semibold text-lg">
                TeacherReminder
              </Link>
            </div>
            
            {pageTitle && (
              <h1 className="text-lg font-medium hidden md:block">{pageTitle}</h1>
            )}
            
            <div className="flex items-center gap-2">
              <Link
                to="/create-reminder"
                className="flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium rounded-full text-white bg-teacher-blue hover:bg-teacher-blue/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">New Reminder</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:block text-sm text-muted-foreground hover:text-foreground"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}
      
      <div className="flex-1 flex">
        {showNav && (
          <>
            {/* Mobile menu overlay */}
            {isMenuOpen && (
              <div 
                className="fixed inset-0 bg-black/20 z-20 md:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <nav 
              className={cn(
                "fixed md:sticky top-0 left-0 bottom-0 z-30 w-64 border-r bg-white transform transition-transform duration-200 ease-in-out",
                "md:translate-x-0 md:z-0 md:h-[calc(100vh-4rem)] md:top-16",
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex-1 py-8">
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          location.pathname === item.path
                            ? "bg-teacher-blue text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-teacher-gray"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4 md:hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </>
        )}
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="container mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
