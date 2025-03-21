
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { NotificationTypeProps } from './NotificationTypes';
import PrioritySelect from './PrioritySelect';

const NotificationTypeBase: React.FC<NotificationTypeProps> = ({
  isEnabled,
  onToggle,
  minPriority,
  onPriorityChange,
  icon,
  title,
  children
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        <Switch 
          checked={isEnabled}
          onCheckedChange={onToggle}
        />
      </div>
      
      {isEnabled && (
        <div className="pl-6 space-y-4">
          <PrioritySelect 
            value={minPriority} 
            onChange={onPriorityChange} 
          />
          {children}
        </div>
      )}
    </div>
  );
};

export default NotificationTypeBase;
