
import React from 'react';
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center">
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              currentStep === index ? "bg-teacher-blue" : "bg-teacher-gray"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
