
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import { ArrowLeft } from "lucide-react";
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import SchoolYearSetup from './steps/SchoolYearSetup';
import PeriodSetup from './steps/PeriodSetup';
import SchoolDaysSetup from './steps/SchoolDaysSetup';
import ScheduleSetup from './steps/ScheduleSetup';
import CategorySetup from './steps/CategorySetup';
import SchoolHoursSetup from './steps/SchoolHoursSetup';
import StepIndicator from './StepIndicator';
import OnboardingControls from './OnboardingControls';
import ExitDialog from './ExitDialog';

const OnboardingContent = () => {
  const {
    currentStep,
    schoolYear,
    setSchoolYear,
    termType,
    setTermType,
    termName,
    setTermName,
    updateTermNameFromType,
    periods,
    selectedDays,
    toggleDay,
    handlePeriodNameChange,
    removePeriod,
    addPeriod,
    customScheduleVisibility,
    toggleCustomScheduleVisibility,
    hasCustomSchedule,
    handleScheduleStartTimeChange,
    handleScheduleEndTimeChange,
    toggleCustomSchedule,
    applyScheduleToAllDays,
    categories,
    updateCategory,
    removeCategory,
    addCategory,
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
    setShowExitConfirm,
  } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SchoolYearSetup
            schoolYear={schoolYear}
            setSchoolYear={setSchoolYear}
            termType={termType}
            setTermType={setTermType}
            termName={termName}
            setTermName={setTermName}
            updateTermNameFromType={updateTermNameFromType}
          />
        );
      case 1:
        return (
          <PeriodSetup
            periods={periods}
            handlePeriodNameChange={handlePeriodNameChange}
            removePeriod={removePeriod}
            addPeriod={addPeriod}
          />
        );
      case 2:
        return (
          <SchoolDaysSetup
            selectedDays={selectedDays}
            toggleDay={toggleDay}
          />
        );
      case 3:
        return (
          <ScheduleSetup
            periods={periods}
            selectedDays={selectedDays}
            customScheduleVisibility={customScheduleVisibility}
            toggleCustomScheduleVisibility={toggleCustomScheduleVisibility}
            hasCustomSchedule={hasCustomSchedule}
            handleScheduleStartTimeChange={handleScheduleStartTimeChange}
            handleScheduleEndTimeChange={handleScheduleEndTimeChange}
            toggleCustomSchedule={toggleCustomSchedule}
            applyScheduleToAllDays={applyScheduleToAllDays}
          />
        );
      case 4:
        return (
          <CategorySetup
            categories={categories}
            updateCategory={updateCategory}
            removeCategory={removeCategory}
            addCategory={addCategory}
          />
        );
      case 5:
        return (
          <SchoolHoursSetup
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
          />
        );
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-teacher-gray/30">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Teacher Reminder</h1>
          <p className="text-muted-foreground">
            Let's set up your school schedule
          </p>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="px-6">{renderStep()}</CardContent>
          <CardFooter>
            <OnboardingControls />
          </CardFooter>
        </Card>
        
        <StepIndicator currentStep={currentStep} totalSteps={6} />
      </div>
      
      {currentStep === 0 && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      )}
      
      <ExitDialog />
    </div>
  );
};

const Onboarding: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default Onboarding;
