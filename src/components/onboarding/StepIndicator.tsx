
import React from 'react';
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center gap-2 sm:gap-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-colors",
              currentStep === index ? "bg-teacher-blue" : "bg-teacher-gray"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
