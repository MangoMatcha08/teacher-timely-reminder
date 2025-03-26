
import * as React from 'react';
import { useNavigate } from "react-router-dom";
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

interface ExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExitDialog: React.FC<ExitDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  
  const handleExitOnboarding = () => {
    navigate("/");
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
