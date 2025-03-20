
import React, { useState, useEffect } from 'react';
import { useReminders } from '@/context/ReminderContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { CheckCircle, Clock, Calendar, ListChecks, Plus, ChevronRight, MoreHorizontal } from 'lucide-react';
import ReminderList from '@/components/reminders/ReminderList';
import QuickReminderCreator from '@/components/dashboard/QuickReminderCreator';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PastDueReminders from '@/components/reminders/PastDueReminders';
import CompletedReminders from '@/components/reminders/CompletedReminders';
import Button from '@/components/shared/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

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
      {/* Welcome Card with Quick Actions */}
      <Card className="bg-gradient-to-r from-teacher-lightBlue to-teacher-lightGreen border-none overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                {greeting}, {user?.displayName || 'Teacher'}
              </h1>
              <p className="text-gray-600">
                Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-gray-600">
                You have {todaysReminders.length} {todaysReminders.length === 1 ? 'task' : 'tasks'} planned for today
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2 flex-col sm:flex-row">
              <Button 
                variant="outline" 
                onClick={() => setIsQuickCreateOpen(true)}
                className="flex items-center gap-1 bg-white/80 backdrop-blur-sm shadow-sm border-white"
              >
                <Plus size={16} />
                <span>Quick Reminder</span>
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => navigate('/create-reminder')}
                className="flex items-center gap-1 shadow-md"
              >
                <Plus size={16} />
                <span>Add a Detailed Reminder</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Reminder Creator */}
      {isQuickCreateOpen && (
        <QuickReminderCreator 
          onComplete={handleQuickCreateComplete} 
          onClose={() => setIsQuickCreateOpen(false)} 
        />
      )}
      
      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Button 
          onClick={() => navigate('/create-reminder')}
          className="h-auto py-4 flex flex-col items-center bg-teacher-lightBlue hover:bg-teacher-blue hover:text-white transition-colors border-none"
        >
          <Plus size={24} className="mb-2" />
          <span>Add a Detailed Reminder</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/schedule')}
          className="h-auto py-4 flex flex-col items-center bg-teacher-lightIndigo hover:bg-teacher-indigo hover:text-white transition-colors border-none"
        >
          <Calendar size={24} className="mb-2" />
          <span>Today's Schedule</span>
        </Button>
        
        <Button 
          onClick={() => document.getElementById('completed-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="h-auto py-4 flex flex-col items-center bg-teacher-lightGreen hover:bg-teacher-teal hover:text-white transition-colors border-none"
        >
          <CheckCircle size={24} className="mb-2" />
          <span>Completed Tasks</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/schedule')}
          className="h-auto py-4 flex flex-col items-center bg-teacher-gray hover:bg-teacher-darkGray hover:text-white transition-colors border-none"
        >
          <ListChecks size={24} className="mb-2" />
          <span>Weekly Overview</span>
        </Button>
      </div>
      
      {/* Stats Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          className="bg-green-50 border-green-100"
        />
        <StatCard
          title="Tasks Completed"
          value={`${completedTasks} / ${totalTasks}`}
          icon={<ListChecks className="h-4 w-4 text-blue-500" />}
          className="bg-blue-50 border-blue-100"
        />
        <StatCard
          title="Current Term"
          value={currentTerm?.name || 'Not set'}
          icon={<Calendar className="h-4 w-4 text-purple-500" />}
          className="bg-purple-50 border-purple-100"
        />
        <StatCard
          title="Today's Schedule"
          value={`${todaysReminders.length} items`}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          className="bg-amber-50 border-amber-100"
        />
      </div>
      
      {/* Past Due Reminders */}
      <PastDueReminders />
      
      {/* Tabbed Reminders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Reminders</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/create-reminder')}
            className="flex items-center gap-1"
          >
            <Plus size={14} />
            <span>New</span>
          </Button>
        </div>
        
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full md:w-auto bg-gray-100">
            <TabsTrigger value="today" className="flex-1 md:flex-none">Today</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 md:flex-none">Upcoming</TabsTrigger>
            <TabsTrigger value="past-due" className="flex-1 md:flex-none">Past Due</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4">
            <ReminderList />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">Upcoming reminders will appear here.</p>
              <p className="text-sm text-gray-400 mt-1">This feature is coming soon.</p>
            </div>
          </TabsContent>
          <TabsContent value="past-due" className="mt-4">
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">Past due reminders will appear here.</p>
              <p className="text-sm text-gray-400 mt-1">This feature is coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Completed Reminders */}
      <div id="completed-section">
        <CompletedReminders />
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 z-50 md:hidden">
        <Button
          variant="primary"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsQuickCreateOpen(true)}
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
