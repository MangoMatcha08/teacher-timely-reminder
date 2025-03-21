
import React from "react";
import { Calendar, Grid3X3, Tag } from "lucide-react";
import Button from "@/components/shared/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SchoolSetup } from "@/context/ReminderContext";
import { format, addDays, startOfWeek } from "date-fns";
import { useMobileView } from "@/hooks/use-mobile-view";

interface ScheduleFiltersProps {
  selectedDay: string | null;
  setSelectedDay: (day: string | null) => void;
  selectedPeriod: string | null;
  setSelectedPeriod: (period: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  schoolSetup: SchoolSetup | null;
  currentDate?: Date;
}

const ScheduleFilters = ({
  selectedDay,
  setSelectedDay,
  selectedPeriod,
  setSelectedPeriod,
  selectedCategory,
  setSelectedCategory,
  schoolSetup,
  currentDate = new Date()
}: ScheduleFiltersProps) => {
  const { isMobile, isiOS } = useMobileView();
  
  if (!schoolSetup) return null;
  
  // Generate day names with dates for the dropdown
  const dayItems = () => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    const dayMap: Record<number, string> = {
      1: "M",
      2: "T", 
      3: "W",
      4: "Th",
      5: "F"
    };
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = addDays(startDay, i);
      const dayOfWeek = date.getDay();
      const dayCode = dayMap[dayOfWeek];
      return {
        code: dayCode,
        label: `${dayCode} - ${format(date, "MMM d")}`,
        date
      };
    });
  };
  
  const getSelectedDayLabel = () => {
    if (!selectedDay) return "";
    const day = dayItems().find(d => d.code === selectedDay);
    return day ? day.label : selectedDay;
  };
  
  const buttonClasses = isiOS 
    ? "h-9 text-sm bg-gray-100 border-0 shadow-sm rounded-xl" 
    : "h-8 text-sm";
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={buttonClasses}>
            <Calendar className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
            <span>{selectedDay ? getSelectedDayLabel() : "Day"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`w-56 ${isiOS ? 'rounded-xl shadow-lg' : ''}`}>
          {dayItems().map((item) => (
            <DropdownMenuItem
              key={item.code}
              className="w-full text-left px-3 py-2 text-sm"
              onClick={() => setSelectedDay(item.code)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="w-full text-left px-3 py-2 text-sm"
            onClick={() => setSelectedDay(null)}
          >
            All Days
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={buttonClasses}>
            <Grid3X3 className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
            <span>{selectedPeriod ? schoolSetup.periods.find(p => p.id === selectedPeriod)?.name : "Period"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`w-56 ${isiOS ? 'rounded-xl shadow-lg' : ''}`}>
          {schoolSetup.periods.map((period) => (
            <DropdownMenuItem
              key={period.id}
              className="w-full text-left px-3 py-2 text-sm"
              onClick={() => setSelectedPeriod(period.id)}
            >
              <div className="flex items-center gap-2">
                {period.name}
                {period.isPrepPeriod && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Prep
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="w-full text-left px-3 py-2 text-sm"
            onClick={() => setSelectedPeriod(null)}
          >
            All Periods
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={buttonClasses}>
            <Tag className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
            <span>{selectedCategory || "Category"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`w-56 ${isiOS ? 'rounded-xl shadow-lg' : ''}`}>
          {schoolSetup.categories.map((category) => (
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
            All Categories
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ScheduleFilters;
