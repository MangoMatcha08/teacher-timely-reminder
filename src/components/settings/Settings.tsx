import React from "react";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import Button from "@/components/shared/Button";
import { ArrowLeft, Calendar, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NotificationSettings from "./notifications/NotificationSettings";

interface SettingsProps {
  onResetOnboarding: () => void;
  onModifySettings: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetOnboarding, onModifySettings }) => {
  const { schoolSetup } = useReminders();
  const navigate = useNavigate();
  
  const handleResetOnboarding = () => {
    if (window.confirm("Are you sure you want to restart the onboarding process? This will reset all your settings.")) {
      onResetOnboarding();
    }
  };
  
  const currentTerm = schoolSetup?.terms.find(term => term.id === schoolSetup.termId);
  
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Button>
      </div>
      
      <h1 className="text-xl font-bold">Settings</h1>
      
      {/* Notification Settings */}
      <NotificationSettings />
      
      {/* School Schedule Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-4 w-4 mr-2 text-teacher-blue" />
            <span>School Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-3">
          <div className="space-y-3">
            {currentTerm && (
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-1 text-sm">School Year & Term</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School Year:</span>
                    <span>{currentTerm.schoolYear || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Term:</span>
                    <span>{currentTerm.name}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border rounded-lg p-3">
              <h3 className="font-medium mb-1 text-sm">School Days</h3>
              <div className="flex gap-1">
                {schoolSetup?.schoolDays.map((day) => (
                  <div key={day} className="day-badge day-badge-selected text-xs">
                    {day}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <h3 className="font-medium mb-1 text-sm">School Hours</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School Start:</span>
                  <span>{schoolSetup?.schoolHours.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School End:</span>
                  <span>{schoolSetup?.schoolHours.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher Arrival:</span>
                  <span>{schoolSetup?.schoolHours.teacherArrivalTime}</span>
                </div>
              </div>
            </div>
            
            {schoolSetup?.iepMeetings?.enabled && (
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-1 text-sm">IEP Meetings</h3>
                <div className="space-y-1 text-xs">
                  {schoolSetup.iepMeetings.beforeSchool && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Before School:</span>
                      <span>{schoolSetup.iepMeetings.beforeSchoolTime || "Not specified"}</span>
                    </div>
                  )}
                  {schoolSetup.iepMeetings.afterSchool && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After School:</span>
                      <span>{schoolSetup.iepMeetings.afterSchoolTime || "Not specified"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">Periods</h3>
                <span className="text-xs text-muted-foreground">
                  {schoolSetup?.periods.length} periods
                </span>
              </div>
              <div className="space-y-1">
                {schoolSetup?.periods.map((period) => (
                  <div key={period.id} className="flex justify-between items-center text-xs border-b pb-1 last:border-b-0 last:pb-0">
                    <span>{period.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {period.schedules.length} schedules
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <h3 className="font-medium mb-1 text-sm">Categories</h3>
              <div className="flex flex-wrap gap-1">
                {schoolSetup?.categories.map((category) => (
                  <span key={category} className="px-2 py-0.5 bg-teacher-gray/20 rounded-full text-xs">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t p-3">
          <Button
            variant="outline"
            className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 text-sm h-8"
            onClick={handleResetOnboarding}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Reset Onboarding
          </Button>
          <Button
            variant="primary"
            className="text-sm h-8"
            onClick={onModifySettings}
          >
            <Edit className="h-3 w-3 mr-1" />
            Modify Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
