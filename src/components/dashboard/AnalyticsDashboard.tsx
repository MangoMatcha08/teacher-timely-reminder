
import React, { useState, useEffect } from 'react';
import { useReminders } from '@/context/ReminderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = () => {
  const { reminders, schoolSetup } = useReminders();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term'>('week');
  const [remindersByCategory, setRemindersByCategory] = useState<any[]>([]);
  const [remindersByPriority, setRemindersByPriority] = useState<any[]>([]);
  const [remindersByType, setRemindersByType] = useState<any[]>([]);
  const [remindersByDay, setRemindersByDay] = useState<any[]>([]);
  const [completionRate, setCompletionRate] = useState<number>(0);
  
  useEffect(() => {
    if (reminders.length > 0) {
      analyzeReminders();
    }
  }, [reminders, timeRange]);
  
  const analyzeReminders = () => {
    const now = new Date();
    const filteredReminders = filterRemindersByTimeRange(reminders, timeRange);
    
    // Calculate statistics
    calculateRemindersByCategory(filteredReminders);
    calculateRemindersByPriority(filteredReminders);
    calculateRemindersByType(filteredReminders);
    calculateRemindersByDay(filteredReminders);
    calculateCompletionRate(filteredReminders);
  };
  
  const filterRemindersByTimeRange = (reminders: any[], range: 'week' | 'month' | 'term') => {
    const now = new Date();
    let cutoffDate = new Date();
    
    if (range === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else {
      // For term, try to use the term start date if available
      if (schoolSetup?.terms && schoolSetup.termId) {
        const currentTerm = schoolSetup.terms.find(term => term.id === schoolSetup.termId);
        if (currentTerm && currentTerm.startDate) {
          cutoffDate = new Date(currentTerm.startDate);
        } else {
          // Fallback: last 3 months
          cutoffDate.setMonth(now.getMonth() - 3);
        }
      } else {
        // Fallback: last 3 months
        cutoffDate.setMonth(now.getMonth() - 3);
      }
    }
    
    return reminders.filter(reminder => {
      const reminderDate = reminder.createdAt || new Date();
      return reminderDate >= cutoffDate;
    });
  };
  
  const calculateRemindersByCategory = (filteredReminders: any[]) => {
    const categoryMap: Record<string, number> = {};
    
    filteredReminders.forEach(reminder => {
      const category = reminder.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
    
    setRemindersByCategory(categoryData);
  };
  
  const calculateRemindersByPriority = (filteredReminders: any[]) => {
    const priorityMap: Record<string, number> = {
      'Low': 0,
      'Medium': 0,
      'High': 0
    };
    
    filteredReminders.forEach(reminder => {
      const priority = reminder.priority || 'Medium';
      priorityMap[priority] = (priorityMap[priority] || 0) + 1;
    });
    
    const priorityData = Object.entries(priorityMap).map(([name, value]) => ({
      name,
      value
    }));
    
    setRemindersByPriority(priorityData);
  };
  
  const calculateRemindersByType = (filteredReminders: any[]) => {
    const typeMap: Record<string, number> = {};
    
    filteredReminders.forEach(reminder => {
      const type = reminder.type || 'Other';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    
    const typeData = Object.entries(typeMap).map(([name, value]) => ({
      name: name === '_none' ? 'Other' : name,
      value
    }));
    
    setRemindersByType(typeData);
  };
  
  const calculateRemindersByDay = (filteredReminders: any[]) => {
    const dayMap: Record<string, { total: number, completed: number }> = {
      'M': { total: 0, completed: 0 },
      'T': { total: 0, completed: 0 },
      'W': { total: 0, completed: 0 },
      'Th': { total: 0, completed: 0 },
      'F': { total: 0, completed: 0 }
    };
    
    filteredReminders.forEach(reminder => {
      reminder.days.forEach((day: string) => {
        if (dayMap[day]) {
          dayMap[day].total += 1;
          if (reminder.completed) {
            dayMap[day].completed += 1;
          }
        }
      });
    });
    
    const dayData = Object.entries(dayMap).map(([name, { total, completed }]) => ({
      name,
      total,
      completed,
      pending: total - completed
    }));
    
    setRemindersByDay(dayData);
  };
  
  const calculateCompletionRate = (filteredReminders: any[]) => {
    if (filteredReminders.length === 0) {
      setCompletionRate(0);
      return;
    }
    
    const completed = filteredReminders.filter(reminder => reminder.completed).length;
    const rate = (completed / filteredReminders.length) * 100;
    setCompletionRate(Math.round(rate));
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Analytics</h2>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="term">Term</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{completionRate}%</CardTitle>
            <CardDescription>Reminder Completion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{reminders.length}</CardTitle>
            <CardDescription>Total Reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {remindersByPriority.map(item => (
                <div key={item.name} className="flex justify-between items-center mb-1">
                  <span>{item.name} Priority:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">
              {remindersByDay.reduce((acc, day) => acc + day.total, 0)}
            </CardTitle>
            <CardDescription>Activities by Day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {remindersByDay.map(item => (
                <div key={item.name} className="flex justify-between items-center mb-1">
                  <span>{item.name}:</span>
                  <span className="font-medium">{item.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reminders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {remindersByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={remindersByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {remindersByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reminders by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {remindersByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={remindersByDay}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#00C49F" name="Completed" />
                    <Bar dataKey="pending" stackId="a" fill="#FF8042" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
