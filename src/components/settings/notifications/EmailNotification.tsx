
import React from 'react';
import { Mail, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Button from '@/components/shared/Button';
import NotificationTypeBase from './NotificationTypeBase';
import { ReminderPriority } from '@/context/ReminderContext';

interface EmailNotificationProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  emailAddress: string;
  onEmailChange: (email: string) => void;
  minPriority: ReminderPriority;
  onPriorityChange: (priority: ReminderPriority) => void;
  onSendTest: () => void;
  isSending: boolean;
}

const EmailNotification: React.FC<EmailNotificationProps> = ({
  isEnabled,
  onToggle,
  emailAddress,
  onEmailChange,
  minPriority,
  onPriorityChange,
  onSendTest,
  isSending
}) => {
  return (
    <NotificationTypeBase
      isEnabled={isEnabled}
      onToggle={onToggle}
      minPriority={minPriority}
      onPriorityChange={onPriorityChange}
      icon={<Mail className="h-4 w-4 text-blue-600" />}
      title="Email Notifications"
    >
      <div className="space-y-2">
        <label htmlFor="email-address" className="text-sm text-muted-foreground">
          Email Address
        </label>
        <Input 
          id="email-address"
          type="email"
          value={emailAddress}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter your email"
          className="max-w-md"
        />
      </div>
      
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSendTest}
          disabled={isSending || !emailAddress}
          className="flex items-center gap-1"
        >
          {isSending ? (
            <>
              <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-3 w-3 mr-1" />
              Send Test Notification
            </>
          )}
        </Button>
      </div>
    </NotificationTypeBase>
  );
};

export default EmailNotification;
