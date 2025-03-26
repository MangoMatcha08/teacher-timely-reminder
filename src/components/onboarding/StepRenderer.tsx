
import * as React from "react";
import SchoolYearSetup from "./steps/SchoolYearSetup";
import SchoolDaysSetup from "./steps/SchoolDaysSetup";
import PeriodSetup from "./steps/PeriodSetup";
import SchoolHoursSetup from "./steps/SchoolHoursSetup";
import CategorySetup from "./steps/CategorySetup";
import ScheduleSetup from "./steps/ScheduleSetup";
import { useOnboarding } from "./context/OnboardingContext";

const StepRenderer: React.FC = () => {
  const onboarding = useOnboarding();
  const { 
    currentStep,
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

  // Render the current step
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

export default StepRenderer;
