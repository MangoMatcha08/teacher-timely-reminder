
import React from "react";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import Button from "@/components/shared/Button";
import { ArrowLeft, Clock, Calendar, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings: React.FC = () => {
  const { schoolSetup } = useReminders();
  const navigate = useNavigate();
  
  const handleResetOnboarding = () => {
    if (window.confirm("Are you sure you want to restart the onboarding process? This will reset all your settings.")) {
      // We'll use localStorage to reset the onboarding flag
      localStorage.removeItem("hasCompletedOnboarding");
      // Reload the page to trigger the auth check which will redirect to onboarding
      window.location.reload();
    }
  };
  
  const currentTerm = schoolSetup?.terms.find(term => term.id === schoolSetup.termId);
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-teacher-blue" />
            <span>School Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {currentTerm && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">School Year & Term</h3>
                <div className="space-y-2 text-sm">
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
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">School Days</h3>
              <div className="flex gap-2">
                {schoolSetup?.schoolDays.map((day) => (
                  <div key={day} className="day-badge day-badge-selected">
                    {day}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">School Hours</h3>
              <div className="space-y-2 text-sm">
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
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">IEP Meetings</h3>
                <div className="space-y-2 text-sm">
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
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Periods</h3>
                <span className="text-xs text-muted-foreground">
                  {schoolSetup?.periods.length} periods
                </span>
              </div>
              <div className="space-y-2">
                {schoolSetup?.periods.map((period) => (
                  <div key={period.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0 last:pb-0">
                    <span>{period.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {period.schedules.length} schedules
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {schoolSetup?.categories.map((category) => (
                  <span key={category} className="px-2 py-1 bg-teacher-gray/20 rounded-full text-xs">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t p-4">
          <Button
            variant="outline"
            className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
            onClick={handleResetOnboarding}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reset Onboarding
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/onboarding")}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modify Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
