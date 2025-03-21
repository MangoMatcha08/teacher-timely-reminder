
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/shared/Card';
import { useReminders, NotificationPreferences } from '@/context/ReminderContext';
import { Bell, CheckCircle2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import { toast } from 'sonner';

import EmailNotification from './EmailNotification';
import PushNotification from './PushNotification';
import TextNotification from './TextNotification';
import TextNotificationDialog from './TextNotificationDialog';
import { NotificationSettingsProps } from './NotificationTypes';

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSave }) => {
  const { schoolSetup, updateNotificationPreferences } = useReminders();
  const [showTextNoticeDialog, setShowTextNoticeDialog] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  
  const defaultPrefs = {
    email: {
      enabled: true,
      address: "zhom08@gmail.com",
      minPriority: "Medium" as const
    },
    push: {
      enabled: false,
      minPriority: "High" as const
    },
    text: {
      enabled: false,
      phoneNumber: "",
      minPriority: "High" as const
    }
  };
  
  const notificationPreferences = schoolSetup?.notificationPreferences || defaultPrefs;
  
  const [formState, setFormState] = useState<NotificationPreferences>(notificationPreferences);
  
  const handleChange = (path: string[], value: any) => {
    setFormState(prev => {
      const newState = { ...prev };
      let current: any = newState;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newState;
    });
  };

  const handleSaveSettings = () => {
    // Validate email
    if (formState.email.enabled && (!formState.email.address || !formState.email.address.includes('@'))) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Validate phone
    if (formState.text.enabled && (!formState.text.phoneNumber || formState.text.phoneNumber.length < 10)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    updateNotificationPreferences(formState);
    toast.success("Notification settings saved");
    
    if (onSave) {
      onSave();
    }
  };
  
  const onSendTest = () => {
    setSendingTestEmail(true);
    
    // Actual sending will happen in the EmailNotification component
    // We'll clear the loading state after a short delay if the
    // actual send function doesn't do it
    setTimeout(() => {
      if (sendingTestEmail) {
        setSendingTestEmail(false);
      }
    }, 5000);
  };
  
  return (
    <>
      <Card className="mb-6">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center text-lg">
            <Bell className="h-4 w-4 mr-2 text-teacher-blue" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 py-4">
          {/* Email Notifications */}
          <EmailNotification 
            isEnabled={formState.email.enabled}
            onToggle={(enabled) => handleChange(['email', 'enabled'], enabled)}
            emailAddress={formState.email.address}
            onEmailChange={(address) => handleChange(['email', 'address'], address)}
            minPriority={formState.email.minPriority}
            onPriorityChange={(priority) => handleChange(['email', 'minPriority'], priority)}
            onSendTest={onSendTest}
            isSending={sendingTestEmail}
          />
          
          {/* Push Notifications */}
          <PushNotification 
            isEnabled={formState.push.enabled}
            onToggle={(enabled) => handleChange(['push', 'enabled'], enabled)}
            minPriority={formState.push.minPriority}
            onPriorityChange={(priority) => handleChange(['push', 'minPriority'], priority)}
          />
          
          {/* Text/SMS Notifications */}
          <TextNotification 
            isEnabled={formState.text.enabled}
            onToggle={(enabled) => handleChange(['text', 'enabled'], enabled)}
            phoneNumber={formState.text.phoneNumber || ''}
            onPhoneChange={(phoneNumber) => handleChange(['text', 'phoneNumber'], phoneNumber)}
            minPriority={formState.text.minPriority}
            onPriorityChange={(priority) => handleChange(['text', 'minPriority'], priority)}
            onShowInfoDialog={() => setShowTextNoticeDialog(true)}
          />
        </CardContent>
        
        <CardFooter className="flex justify-end border-t p-3">
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save Notification Settings
          </Button>
        </CardFooter>
      </Card>
      
      {/* Text Notifications Info Dialog */}
      <TextNotificationDialog 
        isOpen={showTextNoticeDialog} 
        onOpenChange={setShowTextNoticeDialog} 
      />
    </>
  );
};

export default NotificationSettings;
