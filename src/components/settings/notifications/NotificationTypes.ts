
import { ReactNode } from 'react';
import { ReminderPriority } from '@/context/ReminderContext';

export interface NotificationTypeProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  minPriority: ReminderPriority;
  onPriorityChange: (priority: ReminderPriority) => void;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export interface NotificationSettingsProps {
  onSave: () => void;
}
