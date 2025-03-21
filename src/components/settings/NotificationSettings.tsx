
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/shared/Card';
import { useReminders, NotificationPreferences, ReminderPriority } from '@/context/ReminderContext';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, AlertTriangle, Phone, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import Button from '@/components/shared/Button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const NotificationSettings: React.FC = () => {
  const { schoolSetup, updateNotificationPreferences } = useReminders();
  const [showTextNoticeDialog, setShowTextNoticeDialog] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  
  const defaultPrefs = {
    email: {
      enabled: true,
      address: "zhom08@gmail.com",
      minPriority: "Medium" as ReminderPriority
    },
    push: {
      enabled: false,
      minPriority: "High" as ReminderPriority
    },
    text: {
      enabled: false,
      phoneNumber: "",
      minPriority: "High" as ReminderPriority
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
  };
  
  const sendTestNotification = () => {
    setSendingTestEmail(true);
    
    // Simulate sending test email
    setTimeout(() => {
      setSendingTestEmail(false);
      if (formState.email.enabled && formState.email.address) {
        console.log(`Email notification for "Test Notification" would be sent to ${formState.email.address}`);
        toast.success(`Test notification sent to ${formState.email.address}`, {
          description: "Check your inbox for the test email.",
          action: {
            label: "Dismiss",
            onClick: () => {}
          }
        });
      } else {
        toast.error("Email notifications are not enabled", {
          description: "Enable email notifications and provide a valid email address first."
        });
      }
    }, 1500);
  };
  
  const priorityOptions: ReminderPriority[] = ["Low", "Medium", "High"];
  
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium">Email Notifications</h3>
              </div>
              <Switch 
                checked={formState.email.enabled}
                onCheckedChange={(checked) => handleChange(['email', 'enabled'], checked)}
              />
            </div>
            
            {formState.email.enabled && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email-address" className="text-sm text-muted-foreground">
                    Email Address
                  </label>
                  <Input 
                    id="email-address"
                    type="email"
                    value={formState.email.address}
                    onChange={(e) => handleChange(['email', 'address'], e.target.value)}
                    placeholder="Enter your email"
                    className="max-w-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email-priority" className="text-sm text-muted-foreground">
                    Minimum Priority
                  </label>
                  <Select 
                    value={formState.email.minPriority}
                    onValueChange={(value) => handleChange(['email', 'minPriority'], value as ReminderPriority)}
                  >
                    <SelectTrigger className="max-w-[180px]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    You will receive email notifications for reminders with this priority or higher.
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={sendTestNotification}
                    disabled={sendingTestEmail || !formState.email.address}
                    className="flex items-center gap-1"
                  >
                    {sendingTestEmail ? (
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
              </div>
            )}
          </div>
          
          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-600" />
                <h3 className="font-medium">Push Notifications</h3>
              </div>
              <Switch 
                checked={formState.push.enabled}
                onCheckedChange={(checked) => handleChange(['push', 'enabled'], checked)}
              />
            </div>
            
            {formState.push.enabled && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="push-priority" className="text-sm text-muted-foreground">
                    Minimum Priority
                  </label>
                  <Select 
                    value={formState.push.minPriority}
                    onValueChange={(value) => handleChange(['push', 'minPriority'], value as ReminderPriority)}
                  >
                    <SelectTrigger className="max-w-[180px]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    You will receive push notifications for reminders with this priority or higher.
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-700">
                    <p className="font-medium mb-1">Browser Notification Permission</p>
                    <p>You'll need to allow notifications in your browser when prompted for push notifications to work.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Text/SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <h3 className="font-medium">Text/SMS Notifications</h3>
              </div>
              <Switch 
                checked={formState.text.enabled}
                onCheckedChange={(checked) => {
                  handleChange(['text', 'enabled'], checked);
                  if (checked) {
                    setShowTextNoticeDialog(true);
                  }
                }}
              />
            </div>
            
            {formState.text.enabled && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone-number" className="text-sm text-muted-foreground">
                    Phone Number
                  </label>
                  <Input 
                    id="phone-number"
                    type="tel"
                    value={formState.text.phoneNumber || ''}
                    onChange={(e) => handleChange(['text', 'phoneNumber'], e.target.value)}
                    placeholder="Enter your phone number"
                    className="max-w-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="text-priority" className="text-sm text-muted-foreground">
                    Minimum Priority
                  </label>
                  <Select 
                    value={formState.text.minPriority}
                    onValueChange={(value) => handleChange(['text', 'minPriority'], value as ReminderPriority)}
                  >
                    <SelectTrigger className="max-w-[180px]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    You will receive text notifications for reminders with this priority or higher.
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-700">
                    <p className="font-medium mb-1">Demo Mode Notice</p>
                    <p>This is currently in demo mode. In a production environment, text notifications would require integration with a third-party SMS service like Twilio and would incur charges based on usage.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
      <Dialog open={showTextNoticeDialog} onOpenChange={setShowTextNoticeDialog}>
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
    </>
  );
};

export default NotificationSettings;
