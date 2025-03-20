
import React from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TimeInput from "@/components/shared/TimeInput";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import Button from "@/components/shared/Button";
import { toast } from "sonner";

interface ScheduleSetupProps {
  periods: Period[];
  selectedDays: DayOfWeek[];
  customScheduleVisibility: Record<string, boolean>;
  toggleCustomScheduleVisibility: (periodId: string) => void;
  hasCustomSchedule: (periodId: string, day: DayOfWeek) => boolean;
  handleScheduleStartTimeChange: (periodId: string, day: DayOfWeek, time: string) => void;
  handleScheduleEndTimeChange: (periodId: string, day: DayOfWeek, time: string) => void;
  toggleCustomSchedule: (periodId: string, day: DayOfWeek, isCustom: boolean) => void;
  applyScheduleToAllDays: (periodId: string, sourceDayOfWeek: DayOfWeek) => void;
}

const ScheduleSetup: React.FC<ScheduleSetupProps> = ({
  periods,
  selectedDays,
  customScheduleVisibility,
  toggleCustomScheduleVisibility,
  hasCustomSchedule,
  handleScheduleStartTimeChange,
  handleScheduleEndTimeChange,
  toggleCustomSchedule,
  applyScheduleToAllDays
}) => {
  const days: { label: string; value: DayOfWeek }[] = [
    { label: "M", value: "M" },
    { label: "T", value: "T" },
    { label: "W", value: "W" },
    { label: "Th", value: "Th" },
    { label: "F", value: "F" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">Schedule your periods</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Set the times for each period. Most days follow the same schedule, but you can customize exceptions.
        </p>
        
        <div className="space-y-6">
          {periods.map((period) => (
            <Collapsible
              key={period.id}
              className="border rounded-lg bg-white overflow-hidden"
              defaultOpen={true}
            >
              <div className="p-4 flex items-center justify-between border-b">
                <h3 className="font-medium">{period.name}</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent>
                <div className="p-4">
                  {selectedDays.length > 0 && (
                    <div className="p-4 border rounded-md bg-gray-50 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium">Default Period Time</h5>
                        <div className="text-xs text-muted-foreground">
                          Set once and apply to all days
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TimeInput
                          label="Start Time"
                          value={period.schedules.length > 0 ? period.schedules[0].startTime : "9:00 AM"}
                          onChange={(time) => {
                            if (period.schedules.length > 0) {
                              handleScheduleStartTimeChange(period.id, period.schedules[0].dayOfWeek, time);
                              // Apply to all non-custom schedules
                              period.schedules.forEach(schedule => {
                                if (!hasCustomSchedule(period.id, schedule.dayOfWeek)) {
                                  handleScheduleStartTimeChange(period.id, schedule.dayOfWeek, time);
                                }
                              });
                            }
                          }}
                          id={`period-${period.id}-default-start`}
                        />
                        
                        <TimeInput
                          label="End Time"
                          value={period.schedules.length > 0 ? period.schedules[0].endTime : "9:50 AM"}
                          onChange={(time) => {
                            if (period.schedules.length > 0) {
                              handleScheduleEndTimeChange(period.id, period.schedules[0].dayOfWeek, time);
                              // Apply to all non-custom schedules
                              period.schedules.forEach(schedule => {
                                if (!hasCustomSchedule(period.id, schedule.dayOfWeek)) {
                                  handleScheduleEndTimeChange(period.id, schedule.dayOfWeek, time);
                                }
                              });
                            }
                          }}
                          id={`period-${period.id}-default-end`}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Collapsible
                    className="border rounded-md"
                    open={customScheduleVisibility[period.id]}
                    onOpenChange={() => toggleCustomScheduleVisibility(period.id)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <h5 className="text-sm font-medium">Custom Day Schedules</h5>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        customScheduleVisibility[period.id] ? "rotate-90" : ""
                      )} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="p-3 space-y-3">
                      <p className="text-xs text-muted-foreground mb-2">
                        Enable custom schedules for days that differ from the default
                      </p>
                      
                      {selectedDays.map((day) => {
                        const isCustom = hasCustomSchedule(period.id, day);
                        const dayLabel = days.find(d => d.value === day)?.label;
                        
                        return (
                          <div key={`${period.id}-${day}-schedule`} 
                              className="border rounded-md bg-white overflow-hidden">
                            <div className="flex items-center justify-between border-b px-4 py-2 bg-gray-50">
                              <div className="flex items-center">
                                <div className="day-badge day-badge-selected mr-2">
                                  {dayLabel}
                                </div>
                                <h5 className="text-sm font-medium">
                                  {dayLabel} Schedule
                                </h5>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground mr-2">
                                  Custom schedule
                                </div>
                                <Switch
                                  checked={isCustom}
                                  onCheckedChange={(checked) => {
                                    if (!checked && isCustom) {
                                      toggleCustomSchedule(period.id, day, isCustom);
                                    } else if (checked && !isCustom) {
                                      const schedule = period.schedules.find(s => s.dayOfWeek === day);
                                      if (schedule) {
                                        const [hourStr, minuteStr] = schedule.endTime.split(':');
                                        const [minutes, meridian] = minuteStr.split(' ');
                                        let hour = parseInt(hourStr);
                                        let minute = parseInt(minutes) + 5;
                                        if (minute >= 60) {
                                          minute = 0;
                                          hour = (hour % 12) + 1;
                                        }
                                        const newEndTime = `${hour}:${minute.toString().padStart(2, '0')} ${meridian}`;
                                        handleScheduleEndTimeChange(period.id, day, newEndTime);
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            
                            {isCustom && (
                              <div className="p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <TimeInput
                                    label="Start Time"
                                    value={period.schedules.find(s => s.dayOfWeek === day)?.startTime || "9:00 AM"}
                                    onChange={(time) => handleScheduleStartTimeChange(period.id, day, time)}
                                    id={`period-${period.id}-${day}-start`}
                                  />
                                  
                                  <TimeInput
                                    label="End Time"
                                    value={period.schedules.find(s => s.dayOfWeek === day)?.endTime || "9:50 AM"}
                                    onChange={(time) => handleScheduleEndTimeChange(period.id, day, time)}
                                    id={`period-${period.id}-${day}-end`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleSetup;
