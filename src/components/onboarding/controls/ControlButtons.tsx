
import * as React from "react";
import { Button } from "@/components/ui/button";

interface ExitButtonProps {
  onClick: () => void;
}

export const ExitButton: React.FC<ExitButtonProps> = ({ onClick }) => (
  <Button
    variant="secondary"
    onClick={onClick}
  >
    Exit Setup
  </Button>
);

interface NavigationButtonsProps {
  currentStep: number;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  isLastStep,
  onPrevious,
  onNext,
  onFinish
}) => (
  <div>
    {currentStep > 0 && (
      <Button
        variant="outline"
        onClick={onPrevious}
        className="mr-2"
      >
        Previous
      </Button>
    )}
    
    {isLastStep ? (
      <Button onClick={onFinish}>
        Finish
      </Button>
    ) : (
      <Button onClick={onNext}>
        Next
      </Button>
    )}
  </div>
);
