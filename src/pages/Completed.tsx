
import React, { useState } from "react";
import { useReminders } from "@/context/ReminderContext";
import Layout from "@/components/shared/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ClipboardCheck, Calendar, Search, Tag, ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReminderCardList from "@/components/schedule/ReminderCardList";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";

const Completed = () => {
  const { reminders, schoolSetup } = useReminders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  // Get only completed reminders
  const completedReminders = reminders.filter(reminder => reminder.completed);
  
  // Filter by search query, period, category, and time
  const filteredReminders = completedReminders.filter(reminder => {
    // Search filter
    if (searchQuery && !reminder.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Period filter
    if (selectedPeriod && reminder.periodId !== selectedPeriod) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && reminder.category !== selectedCategory) {
      return false;
    }
    
    // Time filter
    if (timeFilter !== "all" && reminder.dueDate) {
      const dueDate = new Date(reminder.dueDate);
      
      if (timeFilter === "today" && !isToday(dueDate)) {
        return false;
      }
      
      if (timeFilter === "week" && !isThisWeek(dueDate)) {
        return false;
      }
      
      if (timeFilter === "month" && !isThisMonth(dueDate)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Group reminders by completed date (most recent first)
  const groupedReminders: { [date: string]: typeof filteredReminders } = {};
  
  filteredReminders.forEach(reminder => {
    // Use updated_at as the completion date (approximate)
    const completedDate = reminder.createdAt ? format(new Date(reminder.createdAt), "yyyy-MM-dd") : "Unknown";
    
    if (!groupedReminders[completedDate]) {
      groupedReminders[completedDate] = [];
    }
    
    groupedReminders[completedDate].push(reminder);
  });
  
  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedReminders).sort().reverse();
  
  return (
    <Layout pageTitle="Completed Tasks">
      <div className="space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-semibold tracking-tight">Completed Tasks</h1>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {completedReminders.length}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search completed tasks..."
              className="w-full pl-8 md:max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedCategory || ""} 
              onValueChange={(value) => setSelectedCategory(value || null)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {schoolSetup?.categories?.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedPeriod || ""} 
              onValueChange={(value) => setSelectedPeriod(value || null)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <ListFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All periods</SelectItem>
                {schoolSetup?.periods?.map((period) => (
                  <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredReminders.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="space-y-3">
                <div className="flex items-center">
                  <div className="flex-grow h-px bg-gray-200 mr-3"></div>
                  <h2 className="text-sm font-medium text-gray-500 whitespace-nowrap">
                    <Calendar className="inline-block h-4 w-4 mr-1.5 mb-0.5" />
                    {format(new Date(date), "MMMM d, yyyy")}
                  </h2>
                  <div className="flex-grow h-px bg-gray-200 ml-3"></div>
                </div>
                
                <ReminderCardList 
                  reminders={groupedReminders[date]}
                  schoolSetup={schoolSetup}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border rounded-lg">
            <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No completed tasks found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery || selectedCategory || selectedPeriod || timeFilter !== 'all' 
                ? "No tasks match your current filters. Try adjusting your search criteria."
                : "Once you complete tasks, they will appear here."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Completed;
