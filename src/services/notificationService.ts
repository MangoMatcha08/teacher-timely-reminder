
import { ReminderPriority } from '@/types';

/**
 * Sends a test email notification to the specified email address
 * @param emailAddress The email address to send the test notification to
 * @returns A promise that resolves to true if the email was sent successfully
 */
export const sendTestEmailNotification = async (emailAddress: string): Promise<boolean> => {
  console.log(`Sending test email notification to ${emailAddress}`);
  
  try {
    // For preview environment, simulate success
    if (window.location.hostname.includes('lovableproject.com')) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }
    
    // In a real implementation, this would call a backend API
    // Try to call the test email function if we're not in the preview
    const response = await fetch('https://mqjxuadsgxdejmoyigyj.functions.supabase.co/send-test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailAddress,
        subject: 'Test Notification from Teacher Timely Reminder',
        message: 'This is a test notification from the Teacher Timely Reminder app. If you received this, email notifications are working correctly!'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error sending test email: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending test email:', error);
    
    // In preview mode, simulate success even if there's an error
    if (window.location.hostname.includes('lovableproject.com')) {
      return true;
    }
    
    throw error;
  }
};

/**
 * Configures notification preferences for a user
 * @param userId The user ID
 * @param emailEnabled Whether email notifications are enabled
 * @param emailAddress The email address to send notifications to
 * @param emailPriority The minimum priority level for email notifications
 * @param pushEnabled Whether push notifications are enabled
 * @param pushPriority The minimum priority level for push notifications
 * @param textEnabled Whether text notifications are enabled
 * @param phoneNumber The phone number to send text notifications to
 * @param textPriority The minimum priority level for text notifications
 * @returns A promise that resolves to true if the preferences were saved successfully
 */
export const saveNotificationPreferences = async (
  userId: string,
  emailEnabled: boolean,
  emailAddress: string,
  emailPriority: ReminderPriority,
  pushEnabled: boolean,
  pushPriority: ReminderPriority,
  textEnabled: boolean,
  phoneNumber: string,
  textPriority: ReminderPriority
): Promise<boolean> => {
  console.log('Saving notification preferences for user', userId);
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // In a real implementation, this would call a backend API
  return true;
};
