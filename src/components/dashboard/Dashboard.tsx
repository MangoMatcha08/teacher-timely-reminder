
import React, { useState, useEffect } from 'react';
import { useReminders } from '@/context/ReminderContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { CheckCircle, Clock, Calendar, ListChecks, Plus } from 'lucide-react';
import ReminderList from '@/components/reminders/ReminderList';
import QuickReminderCreator from '@/components/dashboard/QuickReminderCreator';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PastDueReminders from '@/components/reminders/PastDueReminders';
import Button from '@/components/shared/Button';

const StatCard = ({ title, value, icon, className = '' }) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { completedTasks, totalTasks, todaysReminders, schoolSetup } = useReminders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
  
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  const currentTerm = schoolSetup?.terms.find(term => term.id === schoolSetup.termId);
  
  const handleQuickCreateComplete = () => {
    setIsQuickCreateOpen(false);
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user?.displayName || 'Teacher'}
        </h1>
        <p className="text-muted-foreground">
          Here's what's on your schedule for today.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          className="bg-green-50"
        />
        <StatCard
          title="Tasks Completed"
          value={`${completedTasks} / ${totalTasks}`}
          icon={<ListChecks className="h-4 w-4 text-blue-500" />}
          className="bg-blue-50"
        />
        <StatCard
          title="Current Term"
          value={currentTerm?.name || 'Not set'}
          icon={<Calendar className="h-4 w-4 text-purple-500" />}
          className="bg-purple-50"
        />
        <StatCard
          title="Today's Schedule"
          value={`${todaysReminders.length} items`}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          className="bg-amber-50"
        />
      </div>
      
      {/* Add Past Due Reminders component */}
      <PastDueReminders />
      
      {/* Quick Reminder Creator */}
      {isQuickCreateOpen && (
        <QuickReminderCreator 
          onComplete={handleQuickCreateComplete} 
          onClose={() => setIsQuickCreateOpen(false)} 
        />
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Today's Reminders</h2>
          <Button 
            variant="primary" 
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            <span>Quick Add</span>
          </Button>
        </div>
        <ReminderList />
      </div>
    </div>
  );
};

export default Dashboard;
