import React from "react";
import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import ReminderList from "@/components/reminders/ReminderList";
import QuickReminderCreator from "@/components/dashboard/QuickReminderCreator";
import { useReminders } from "@/context/ReminderContext";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/shared/Button";

const Dashboard = () => {
  const { schoolSetup, reminders, fetchReminders } = useReminders();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false);
  
  const handleQuickCreateComplete = () => {
    setIsQuickCreateOpen(false);
    fetchReminders();
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Reminders</h1>
          <Link 
            to="/settings"
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Settings2 className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Move filters below header */}
        <div className="flex flex-wrap gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Category <span className="ml-2 hidden sm:inline">
                  {selectedCategory ? `(${selectedCategory})` : ""}
                </span>
                <Calendar className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {schoolSetup?.categories.map((category) => (
                <button
                  key={category}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Category
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Priority <span className="ml-2 hidden sm:inline">
                  {selectedPriority ? `(${selectedPriority})` : ""}
                </span>
                <Calendar className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {["Low", "Medium", "High"].map((priority) => (
                <button
                  key={priority}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setSelectedPriority(priority)}
                >
                  {priority}
                </button>
              ))}
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => setSelectedPriority(null)}
              >
                Clear Priority
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setIsQuickCreateOpen(true)}>
            Quick Add
          </Button>
          <Link to="/create-reminder">
            <Button>Create Reminder</Button>
          </Link>
        </div>
        
        <ReminderList reminders={filteredReminders} />
      </div>
      
      {isQuickCreateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md animate-scale-in">
            <QuickReminderCreator onComplete={handleQuickCreateComplete} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
