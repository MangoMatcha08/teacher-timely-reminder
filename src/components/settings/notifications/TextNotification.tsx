
import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationTypeBase from './NotificationTypeBase';
import { ReminderPriority } from '@/context/ReminderContext';

interface TextNotificationProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  minPriority: ReminderPriority;
  onPriorityChange: (priority: ReminderPriority) => void;
  onShowInfoDialog: () => void;
}

const TextNotification: React.FC<TextNotificationProps> = ({
  isEnabled,
  onToggle,
  phoneNumber,
  onPhoneChange,
  minPriority,
  onPriorityChange,
  onShowInfoDialog
}) => {
  const handleToggle = (enabled: boolean) => {
    onToggle(enabled);
    if (enabled) {
      onShowInfoDialog();
    }
  };

  return (
    <NotificationTypeBase
      isEnabled={isEnabled}
      onToggle={handleToggle}
      minPriority={minPriority}
      onPriorityChange={onPriorityChange}
      icon={<Phone className="h-4 w-4 text-green-600" />}
      title="Text/SMS Notifications"
    >
      <div className="space-y-2">
        <label htmlFor="phone-number" className="text-sm text-muted-foreground">
          Phone Number
        </label>
        <Input 
          id="phone-number"
          type="tel"
          value={phoneNumber || ''}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Enter your phone number"
          className="max-w-md"
        />
      </div>
      
      <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-yellow-700">
          <p className="font-medium mb-1">Demo Mode Notice</p>
          <p>This is currently in demo mode. In a production environment, text notifications would require integration with a third-party SMS service like Twilio and would incur charges based on usage.</p>
        </div>
      </div>
    </NotificationTypeBase>
  );
};

export default TextNotification;
