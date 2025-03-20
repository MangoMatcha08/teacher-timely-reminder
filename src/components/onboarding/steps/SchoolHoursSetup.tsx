
import React from 'react';
import TimeInput from "@/components/shared/TimeInput";
import { Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SchoolHoursSetupProps {
  schoolStart: string;
  setSchoolStart: (time: string) => void;
  schoolEnd: string;
  setSchoolEnd: (time: string) => void;
  teacherArrival: string;
  setTeacherArrival: (time: string) => void;
  iepMeetingsEnabled: boolean;
  setIepMeetingsEnabled: (enabled: boolean) => void;
  iepBeforeSchool: boolean;
  setIepBeforeSchool: (enabled: boolean) => void;
  iepBeforeSchoolTime: string;
  setIepBeforeSchoolTime: (time: string) => void;
  iepAfterSchool: boolean;
  setIepAfterSchool: (enabled: boolean) => void;
  iepAfterSchoolTime: string;
  setIepAfterSchoolTime: (time: string) => void;
}

const SchoolHoursSetup: React.FC<SchoolHoursSetupProps> = ({
  schoolStart,
  setSchoolStart,
  schoolEnd,
  setSchoolEnd,
  teacherArrival,
  setTeacherArrival,
  iepMeetingsEnabled,
  setIepMeetingsEnabled,
  iepBeforeSchool,
  setIepBeforeSchool,
  iepBeforeSchoolTime,
  setIepBeforeSchoolTime,
  iepAfterSchool,
  setIepAfterSchool,
  iepAfterSchoolTime,
  setIepAfterSchoolTime
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">School Hours</h2>
        <p className="text-sm text-muted-foreground mb-6">
          These times will help set reminders for your day.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TimeInput
              label="School Start Time"
              value={schoolStart}
              onChange={setSchoolStart}
              id="school-start"
            />
            
            <TimeInput
              label="School End Time"
              value={schoolEnd}
              onChange={setSchoolEnd}
              id="school-end"
            />
          </div>
          
          <div className="space-y-4">
            <TimeInput
              label="When do you usually arrive at school?"
              value={teacherArrival}
              onChange={setTeacherArrival}
              id="teacher-arrival"
            />
            
            <div className="flex items-start mt-2 pt-2">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
              <p className="text-sm text-muted-foreground">
                This helps us schedule your reminders when you'll be at school and able to prepare.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">IEP Meeting Settings</h3>
            <Switch 
              checked={iepMeetingsEnabled}
              onCheckedChange={setIepMeetingsEnabled}
            />
          </div>
          
          {iepMeetingsEnabled && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                When do you typically hold IEP meetings?
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="iep-before-school"
                      checked={iepBeforeSchool}
                      onChange={(e) => setIepBeforeSchool(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="iep-before-school" className="text-sm">
                      Before school
                    </label>
                  </div>
                  
                  {iepBeforeSchool && (
                    <div className="w-32">
                      <TimeInput
                        label=""
                        value={iepBeforeSchoolTime}
                        onChange={setIepBeforeSchoolTime}
                        id="iep-before-time"
                        compact={true}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="iep-after-school"
                      checked={iepAfterSchool}
                      onChange={(e) => setIepAfterSchool(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="iep-after-school" className="text-sm">
                      After school
                    </label>
                  </div>
                  
                  {iepAfterSchool && (
                    <div className="w-32">
                      <TimeInput
                        label=""
                        value={iepAfterSchoolTime}
                        onChange={setIepAfterSchoolTime}
                        id="iep-after-time"
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolHoursSetup;
