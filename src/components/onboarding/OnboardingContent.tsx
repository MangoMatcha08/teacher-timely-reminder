
import * as React from "react";
import { useOnboarding } from "./context/OnboardingContext";
import StepIndicator from "./StepIndicator";
import OnboardingControls from "./OnboardingControls";
import ExitDialog from "./ExitDialog";
import SchoolYearSetup from "./steps/SchoolYearSetup";
import SchoolDaysSetup from "./steps/SchoolDaysSetup";
import PeriodSetup from "./steps/PeriodSetup";
import SchoolHoursSetup from "./steps/SchoolHoursSetup";
import CategorySetup from "./steps/CategorySetup";
import ScheduleSetup from "./steps/ScheduleSetup";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/context/ReminderContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OnboardingContent: React.FC = () => {
  const onboarding = useOnboarding();
  const { 
    currentStep, 
    showExitConfirm, 
    setShowExitConfirm,
    schoolYear,
    setSchoolYear,
    termType,
    setTermType,
    termName,
    setTermName,
    selectedDays,
    toggleDay,
    periods,
    handlePeriodNameChange,
    removePeriod,
    addPeriod,
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
    setIepAfterSchoolTime,
    categories,
    updateCategory,
    removeCategory,
    addCategory,
    customScheduleVisibility,
    toggleCustomScheduleVisibility,
    handleScheduleStartTimeChange,
    handleScheduleEndTimeChange,
    hasCustomSchedule,
    toggleCustomSchedule,
    applyScheduleToAllDays,
    updateTermNameFromType
  } = onboarding;
  
  const { setCompleteOnboarding } = useAuth();
  const { saveSchoolSetup } = useReminders();
  const navigate = useNavigate();

  const handleFinishOnboarding = () => {
    // Destructure only the data we need for the school setup
    const {
      schoolYear,
      termType,
      termName,
      selectedDays,
      periods,
      categories,
      schoolStart,
      schoolEnd,
      teacherArrival,
      iepMeetingsEnabled,
      iepBeforeSchool,
      iepBeforeSchoolTime,
      iepAfterSchool,
      iepAfterSchoolTime,
    } = onboarding;
    
    // Create term object based on type
    let startDate = new Date();
    let endDate = new Date();
    
    if (termType === "semester") {
      endDate.setMonth(startDate.getMonth() + 5);
    } else if (termType === "quarter") {
      endDate.setMonth(startDate.getMonth() + 2.5);
    } else {
      endDate.setMonth(startDate.getMonth() + 9);
    }
    
    const term = {
      id: "term_default",
      name: termName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      schoolYear: schoolYear
    };
    
    // Create the school setup object
    const schoolSetup = {
      termId: term.id,
      terms: [term],
      schoolDays: selectedDays,
      periods: periods,
      schoolHours: {
        startTime: schoolStart,
        endTime: schoolEnd,
        teacherArrivalTime: teacherArrival,
      },
      categories: categories,
      iepMeetings: {
        enabled: iepMeetingsEnabled,
        beforeSchool: iepBeforeSchool,
        afterSchool: iepAfterSchool,
        beforeSchoolTime: iepBeforeSchoolTime,
        afterSchoolTime: iepAfterSchoolTime,
      },
    };
    
    // Save school setup
    saveSchoolSetup(schoolSetup);
    
    // Mark onboarding as completed
    setCompleteOnboarding();
    
    // Navigate to dashboard and show success message
    navigate("/dashboard");
    toast.success("Setup completed! You're all set.");
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SchoolYearSetup 
          schoolYear={schoolYear} 
          setSchoolYear={setSchoolYear}
          termType={termType}
          setTermType={setTermType}
          termName={termName}
          setTermName={setTermName}
          updateTermNameFromType={updateTermNameFromType}
        />;
      case 1:
        return <SchoolDaysSetup 
          selectedDays={selectedDays}
          toggleDay={toggleDay}
        />;
      case 2:
        return <PeriodSetup 
          periods={periods}
          handlePeriodNameChange={handlePeriodNameChange}
          removePeriod={removePeriod}
          addPeriod={addPeriod}
        />;
      case 3:
        return <SchoolHoursSetup 
          schoolStart={schoolStart}
          setSchoolStart={setSchoolStart}
          schoolEnd={schoolEnd}
          setSchoolEnd={setSchoolEnd}
          teacherArrival={teacherArrival}
          setTeacherArrival={setTeacherArrival}
          iepMeetingsEnabled={iepMeetingsEnabled}
          setIepMeetingsEnabled={setIepMeetingsEnabled}
          iepBeforeSchool={iepBeforeSchool}
          setIepBeforeSchool={setIepBeforeSchool}
          iepBeforeSchoolTime={iepBeforeSchoolTime}
          setIepBeforeSchoolTime={setIepBeforeSchoolTime}
          iepAfterSchool={iepAfterSchool}
          setIepAfterSchool={setIepAfterSchool}
          iepAfterSchoolTime={iepAfterSchoolTime}
          setIepAfterSchoolTime={setIepAfterSchoolTime}
        />;
      case 4:
        return <CategorySetup 
          categories={categories}
          updateCategory={updateCategory}
          removeCategory={removeCategory}
          addCategory={addCategory}
        />;
      case 5:
        return <ScheduleSetup 
          periods={periods}
          selectedDays={selectedDays}
          customScheduleVisibility={customScheduleVisibility}
          toggleCustomScheduleVisibility={toggleCustomScheduleVisibility}
          handleScheduleStartTimeChange={handleScheduleStartTimeChange}
          handleScheduleEndTimeChange={handleScheduleEndTimeChange}
          hasCustomSchedule={hasCustomSchedule}
          toggleCustomSchedule={toggleCustomSchedule}
          applyScheduleToAllDays={applyScheduleToAllDays}
        />;
      default:
        return <SchoolYearSetup 
          schoolYear={schoolYear} 
          setSchoolYear={setSchoolYear}
          termType={termType}
          setTermType={setTermType}
          termName={termName}
          setTermName={setTermName}
          updateTermNameFromType={updateTermNameFromType}
        />;
    }
  };
  
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-6">
        <StepIndicator currentStep={currentStep} totalSteps={6} />
        <div className="mt-8">
          {renderStep()}
        </div>
        <OnboardingControls />
      </div>
      
      <ExitDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
      />
    </div>
  );
};

export default OnboardingContent;
