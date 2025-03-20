
import React from "react";
import { Calendar } from "lucide-react";
import Button from "@/components/shared/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SchoolSetup } from "@/context/ReminderContext";

interface ScheduleFiltersProps {
  selectedDay: string | null;
  setSelectedDay: (day: string | null) => void;
  selectedPeriod: string | null;
  setSelectedPeriod: (period: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  schoolSetup: SchoolSetup | null;
}

const ScheduleFilters = ({
  selectedDay,
  setSelectedDay,
  selectedPeriod,
  setSelectedPeriod,
  selectedCategory,
  setSelectedCategory,
  schoolSetup,
}: ScheduleFiltersProps) => {
  if (!schoolSetup) return null;
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 text-sm">
            Day <span className="ml-1 hidden sm:inline">
              {selectedDay ? `(${selectedDay})` : ""}
            </span>
            <Calendar className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {schoolSetup.schoolDays.map((day) => (
            <DropdownMenuItem
              key={day}
              className="w-full text-left px-3 py-2 text-sm"
              onClick={() => setSelectedDay(day)}
            >
              {day}
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
          <Button variant="outline" className="h-8 text-sm">
            Period <span className="ml-1 hidden sm:inline">
              {selectedPeriod ? `(${schoolSetup.periods.find(p => p.id === selectedPeriod)?.name})` : ""}
            </span>
            <Calendar className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {schoolSetup.periods.map((period) => (
            <DropdownMenuItem
              key={period.id}
              className="w-full text-left px-3 py-2 text-sm"
              onClick={() => setSelectedPeriod(period.id)}
            >
              {period.name}
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
          <Button variant="outline" className="h-8 text-sm">
            Category <span className="ml-1 hidden sm:inline">
              {selectedCategory ? `(${selectedCategory})` : ""}
            </span>
            <Calendar className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
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
