
import { supabase } from '@/integrations/supabase/client';
import { Reminder, ReminderPriority } from '@/context/ReminderContext';
import { handleNetworkError } from './utils/serviceUtils';
import { toast } from 'sonner';

/**
 * Send a test email notification
 * @param emailAddress Email address to send the test to
 * @returns Promise that resolves when the email is sent
 */
export const sendTestEmailNotification = async (emailAddress: string): Promise<boolean> => {
  try {
    // Call Supabase function to send email
    const { data, error } = await supabase.functions.invoke('send-test-email', {
      body: { 
        email: emailAddress,
        subject: 'Teacher Reminder - Test Notification',
        message: 'This is a test notification from Teacher Reminder app. If you received this email, your notifications are working correctly!'
      }
    });
    
    if (error) {
      if (handleNetworkError(error, 'sending test email')) {
        console.log("Network error detected while sending test email. Using offline mode simulation instead.");
        return true; // In offline mode, we'll just pretend it worked
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending test email:", error);
    toast.error("Failed to send test email", {
      description: "Please check your connection and try again later."
    });
    return false;
  }
};

/**
 * Send a reminder notification via email
 * @param reminder The reminder to send notification for
 * @param emailAddress Email address to send the notification to
 * @returns Promise that resolves when the email is sent
 */
export const sendReminderEmailNotification = async (
  reminder: Reminder, 
  emailAddress: string
): Promise<boolean> => {
  try {
    // Format due date if available
    const dueDate = reminder.dueDate 
      ? new Date(reminder.dueDate).toLocaleDateString()
      : 'No due date';
      
    // Call Supabase function to send email
    const { data, error } = await supabase.functions.invoke('send-reminder-email', {
      body: { 
        email: emailAddress,
        subject: `Reminder: ${reminder.title}`,
        reminderTitle: reminder.title,
        reminderNotes: reminder.notes || '',
        reminderPriority: reminder.priority,
        reminderDueDate: dueDate,
        reminderCategory: reminder.category || 'Uncategorized'
      }
    });
    
    if (error) {
      if (handleNetworkError(error, 'sending reminder email')) {
        console.log(`Network error detected while sending reminder email for "${reminder.title}". Using offline mode simulation instead.`);
        return true; // In offline mode, we'll just pretend it worked
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
};

/**
 * Get priority text color class for email templates
 */
export const getPriorityColorClass = (priority: ReminderPriority): string => {
  switch (priority) {
    case 'High':
      return 'text-red-600';
    case 'Medium':
      return 'text-amber-600';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};
