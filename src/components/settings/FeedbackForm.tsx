
import React, { useState } from 'react';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

type FeedbackType = 'Bug Report' | 'Feature Request' | 'General Feedback' | 'Question';

const FeedbackForm = () => {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('General Feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.functions.invoke('send-feedback', {
        body: {
          userId: user?.id,
          userEmail: user?.email,
          feedbackType,
          feedback: feedbackText
        }
      });
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      setFeedbackText('');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(`Failed to submit feedback: ${error.message || 'Please try again later'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Feedback</CardTitle>
        <CardDescription>
          Share your thoughts, report bugs, or suggest new features to help us improve
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as FeedbackType)}
            >
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug Report">Bug Report</SelectItem>
                <SelectItem value="Feature Request">Feature Request</SelectItem>
                <SelectItem value="General Feedback">General Feedback</SelectItem>
                <SelectItem value="Question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-text">Your Feedback</Label>
            <Textarea
              id="feedback-text"
              placeholder="Please describe your feedback, issue, or suggestion in detail..."
              rows={6}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FeedbackForm;
