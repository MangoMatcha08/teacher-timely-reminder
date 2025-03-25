
import React, { useState } from 'react';
import { DayOfWeek, Period } from "@/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TimeInput from "@/components/shared/TimeInput";
import { ChevronDown, Calendar, Clock, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import Button from "@/components/shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    { label: "M", value: DayOfWeek.Monday },
    { label: "T", value: DayOfWeek.Tuesday },
    { label: "W", value: DayOfWeek.Wednesday },
    { label: "Th", value: DayOfWeek.Thursday },
    { label: "F", value: DayOfWeek.Friday },
  ];
  
  const [dayCustomScheduleDialogOpen, setDayCustomScheduleDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">Schedule your periods</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Set the times for each period. Most days follow the same schedule, but you can customize specific days.
        </p>
        
        <div className="space-y-6">
          {periods.map((period) => (
            <Collapsible
              key={period.id}
              className="border rounded-lg bg-white overflow-hidden"
              defaultOpen={true}
            >
              <div className="p-4 flex items-center justify-between border-b">
                <h3 className="font-medium flex items-center gap-2">
                  {period.name}
                  {period.isPrepPeriod && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Coffee className="h-3 w-3 mr-1" />
                      Prep Period
                    </span>
                  )}
                </h3>
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
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          <div className="border rounded-lg bg-white overflow-hidden p-4">
            <h3 className="font-medium mb-4">Customize Schedule by Day</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need different schedules for specific days? Customize all periods for a particular day at once.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {selectedDays.map(day => {
                const dayLabel = day === DayOfWeek.Monday ? 'M' : 
                                day === DayOfWeek.Tuesday ? 'T' : 
                                day === DayOfWeek.Wednesday ? 'W' : 
                                day === DayOfWeek.Thursday ? 'Th' : 'F';
                
                const dayName = day === DayOfWeek.Monday ? 'Monday' : 
                                day === DayOfWeek.Tuesday ? 'Tuesday' : 
                                day === DayOfWeek.Wednesday ? 'Wednesday' : 
                                day === DayOfWeek.Thursday ? 'Thursday' : 'Friday';
                
                return (
                  <Button
                    key={day}
                    variant="outline"
                    className="flex flex-col items-center py-3 px-2"
                    onClick={() => {
                      setEditingDay(day);
                      setDayCustomScheduleDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-teacher-blue text-white rounded-full mb-1">
                      {dayLabel}
                    </div>
                    <span className="text-xs">{dayName}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Day-based Schedule Dialog */}
      <Dialog 
        open={dayCustomScheduleDialogOpen} 
        onOpenChange={(open) => {
          setDayCustomScheduleDialogOpen(open);
          if (!open) setEditingDay(null);
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingDay && `Customize ${
                editingDay === DayOfWeek.Monday ? 'Monday' : 
                editingDay === DayOfWeek.Tuesday ? 'Tuesday' : 
                editingDay === DayOfWeek.Wednesday ? 'Wednesday' : 
                editingDay === DayOfWeek.Thursday ? 'Thursday' : 'Friday'
              } Schedule`}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-3">
            <div className="py-2 space-y-6">
              <p className="text-sm text-muted-foreground mb-4">
                Customize all periods for this day at once. Toggle "Custom" to enable specific times for this day.
              </p>
              
              {editingDay && periods.map(period => {
                const isCustom = hasCustomSchedule(period.id, editingDay);
                const schedule = period.schedules.find(s => s.dayOfWeek === editingDay);
                
                return (
                  <div key={`${period.id}-${editingDay}-schedule`} 
                      className="border rounded-md bg-white overflow-hidden">
                    <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
                      <h5 className="text-sm font-medium flex items-center">
                        {period.name}
                        {period.isPrepPeriod && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Coffee className="h-3 w-3 mr-1" />
                            Prep
                          </span>
                        )}
                      </h5>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground mr-2">
                          Custom
                        </div>
                        <Switch
                          checked={isCustom}
                          onCheckedChange={(checked) => {
                            toggleCustomSchedule(period.id, editingDay, checked);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className={cn("p-3", !isCustom && "opacity-50")}>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeInput
                          label="Start Time"
                          value={schedule?.startTime || "9:00 AM"}
                          onChange={(time) => handleScheduleStartTimeChange(period.id, editingDay, time)}
                          id={`period-${period.id}-${editingDay}-start`}
                          disabled={!isCustom}
                        />
                        
                        <TimeInput
                          label="End Time"
                          value={schedule?.endTime || "9:50 AM"}
                          onChange={(time) => handleScheduleEndTimeChange(period.id, editingDay, time)}
                          id={`period-${period.id}-${editingDay}-end`}
                          disabled={!isCustom}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <Button 
            variant="primary" 
            className="w-full mt-4" 
            onClick={() => setDayCustomScheduleDialogOpen(false)}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleSetup;
