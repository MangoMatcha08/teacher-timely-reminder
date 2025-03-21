
import React from "react";
import { useFormContext } from "react-hook-form";
import TitleInput from "./TitleInput";
import TimingSelect from "./TimingSelect";
import PeriodSelect from "./PeriodSelect";
import PrioritySelect from "./PrioritySelect";
import CategorySelect from "./CategorySelect";

const ReminderForm: React.FC = () => {
  const { watch } = useFormContext();
  
  const watchTiming = watch("timing");
  
  // Show period selection only when timing is "During Period"
  const showPeriodSelection = watchTiming === "During Period";

  return (
    <div className="space-y-4">
      {/* Title */}
      <TitleInput />
      
      {/* Timing */}
      <TimingSelect />
      
      {/* Class Period - conditional based on timing */}
      <PeriodSelect show={showPeriodSelection} />
      
      {/* Priority */}
      <PrioritySelect />
      
      {/* Category */}
      <CategorySelect />
    </div>
  );
};

export default ReminderForm;
