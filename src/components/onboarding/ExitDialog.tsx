
import React from 'react';
import { useNavigate } from "react-router-dom";
import { useOnboarding } from './OnboardingContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ExitDialog: React.FC = () => {
  const navigate = useNavigate();
  const { showExitConfirm, setShowExitConfirm } = useOnboarding();
  
  const handleExitOnboarding = () => {
    navigate("/");
  };
  
  return (
    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exit Onboarding?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to go back? Your progress will not be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleExitOnboarding}>
            Exit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitDialog;
