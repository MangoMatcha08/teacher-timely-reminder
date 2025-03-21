
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';

interface TextNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TextNotificationDialog: React.FC<TextNotificationDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Text Notifications</DialogTitle>
          <DialogDescription className="pt-4">
            <p className="mb-4">
              Text message notifications require integration with a third-party SMS service provider such as Twilio, and will incur charges based on usage.
            </p>
            <p className="mb-4">
              In a production environment, you would need to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Set up an account with an SMS provider</li>
              <li>Configure your API keys in the application</li>
              <li>Pay for SMS credits based on your usage</li>
            </ul>
            <p>
              For this demonstration, the text notification feature is simulated and no actual SMS messages will be sent.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TextNotificationDialog;
