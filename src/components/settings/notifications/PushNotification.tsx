
import React from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import NotificationTypeBase from './NotificationTypeBase';
import { ReminderPriority } from '@/context/ReminderContext';

interface PushNotificationProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  minPriority: ReminderPriority;
  onPriorityChange: (priority: ReminderPriority) => void;
}

const PushNotification: React.FC<PushNotificationProps> = ({
  isEnabled,
  onToggle,
  minPriority,
  onPriorityChange
}) => {
  return (
    <NotificationTypeBase
      isEnabled={isEnabled}
      onToggle={onToggle}
      minPriority={minPriority}
      onPriorityChange={onPriorityChange}
      icon={<Bell className="h-4 w-4 text-purple-600" />}
      title="Push Notifications"
    >
      <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-yellow-700">
          <p className="font-medium mb-1">Browser Notification Permission</p>
          <p>You'll need to allow notifications in your browser when prompted for push notifications to work.</p>
        </div>
      </div>
    </NotificationTypeBase>
  );
};

export default PushNotification;
