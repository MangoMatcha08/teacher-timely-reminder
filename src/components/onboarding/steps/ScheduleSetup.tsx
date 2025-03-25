
import React, { useState } from 'react';
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TimeInput from "@/components/shared/TimeInput";
import { ChevronDown, ChevronRight, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import Button from "@/components/shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [customScheduleDialogOpen, setCustomScheduleDialogOpen] = useState(false);

  const editingPeriod = editingPeriodId ? periods.find(p => p.id === editingPeriodId) : null;

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
                  
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                      setEditingPeriodId(period.id);
                      setCustomScheduleDialogOpen(true);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Customize Day Schedules
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
      
      {/* Custom Schedule Dialog */}
      <Dialog 
        open={customScheduleDialogOpen} 
        onOpenChange={(open) => {
          setCustomScheduleDialogOpen(open);
          if (!open) setEditingPeriodId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPeriod ? `Customize ${editingPeriod.name} Schedule` : 'Customize Schedule'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable custom schedules for specific days that differ from the default.
            </p>
            
            {editingPeriod && selectedDays.map((day) => {
              const isCustom = hasCustomSchedule(editingPeriod.id, day);
              const dayLabel = days.find(d => d.value === day)?.label;
              
              return (
                <div key={`${editingPeriod.id}-${day}-schedule`} 
                    className="border rounded-md bg-white overflow-hidden">
                  <div className="flex items-center justify-between border-b px-4 py-2 bg-gray-50">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 bg-teacher-blue text-white rounded-full mr-2">
                        {dayLabel}
                      </div>
                      <h5 className="text-sm font-medium">
                        {dayLabel === 'M' ? 'Monday' : 
                         dayLabel === 'T' ? 'Tuesday' : 
                         dayLabel === 'W' ? 'Wednesday' : 
                         dayLabel === 'Th' ? 'Thursday' : 'Friday'} Schedule
                      </h5>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground mr-2">
                        Custom
                      </div>
                      <Switch
                        checked={isCustom}
                        onCheckedChange={(checked) => {
                          toggleCustomSchedule(editingPeriod.id, day, isCustom);
                        }}
                      />
                    </div>
                  </div>
                  
                  {isCustom && (
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <TimeInput
                          label="Start Time"
                          value={editingPeriod.schedules.find(s => s.dayOfWeek === day)?.startTime || "9:00 AM"}
                          onChange={(time) => handleScheduleStartTimeChange(editingPeriod.id, day, time)}
                          id={`period-${editingPeriod.id}-${day}-start`}
                        />
                        
                        <TimeInput
                          label="End Time"
                          value={editingPeriod.schedules.find(s => s.dayOfWeek === day)?.endTime || "9:50 AM"}
                          onChange={(time) => handleScheduleEndTimeChange(editingPeriod.id, day, time)}
                          id={`period-${editingPeriod.id}-${day}-end`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <Button 
              variant="primary" 
              className="w-full mt-4" 
              onClick={() => setCustomScheduleDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleSetup;
