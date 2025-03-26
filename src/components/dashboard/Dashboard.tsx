
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Calendar } from "lucide-react";
import ReminderList from "@/components/reminders/ReminderList";
import QuickReminderCreator from "@/components/dashboard/QuickReminderCreator";
import { useReminders } from "@/context/ReminderContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Button from "@/components/shared/Button";
import TestControls from "./TestControls";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { schoolSetup, reminders } = useReminders();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false);
  const [showTestTools, setShowTestTools] = React.useState(false);
  
  const handleQuickCreateComplete = () => {
    setIsQuickCreateOpen(false);
    toast.success("Reminder created successfully");
  };
  
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);
  
  const filteredReminders = React.useMemo(() => {
    let filtered = [...reminders];
    
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    if (selectedPriority) {
      filtered = filtered.filter(r => r.priority === selectedPriority);
    }
    
    return filtered;
  }, [reminders, selectedCategory, selectedPriority]);
  
  // Toggle test tools with double click on settings
  const handleSettingsDoubleClick = () => {
    setShowTestTools(prev => !prev);
    if (!showTestTools) {
      toast.success("Firebase testing tools enabled");
    } else {
      toast.info("Firebase testing tools disabled");
    }
  };
  
  return (
    <div className="container mx-auto px-3 py-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Your Reminders</h1>
          <Link 
            to="/settings"
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Settings"
            onDoubleClick={handleSettingsDoubleClick}
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Move filters below header */}
        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-sm">
                Category <span className="ml-1 hidden sm:inline">
                  {selectedCategory ? `(${selectedCategory})` : ""}
                </span>
                <Calendar className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {schoolSetup?.categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="w-full text-left px-3 py-2 text-sm"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-sm">
                Priority <span className="ml-1 hidden sm:inline">
                  {selectedPriority ? `(${selectedPriority})` : ""}
                </span>
                <Calendar className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {["Low", "Medium", "High"].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => setSelectedPriority(priority)}
                >
                  {priority}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="w-full text-left px-3 py-2 text-sm"
                onClick={() => setSelectedPriority(null)}
              >
                Clear Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={() => setIsQuickCreateOpen(true)}
            className="h-8 text-sm"
          >
            Quick Add
          </Button>
          <Link to="/create-reminder">
            <Button className="h-8 text-sm">Create Reminder</Button>
          </Link>
        </div>
        
        {/* Firebase Test Controls */}
        {showTestTools && <TestControls />}
        
        <ReminderList reminders={filteredReminders} />
      </div>
      
      {isQuickCreateOpen && (
        <QuickReminderCreator onComplete={handleQuickCreateComplete} onClose={() => setIsQuickCreateOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
