
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';

interface DashboardStatsProps {
  totalTasks: number;
  completedTasks: number;
  pastDueRemindersCount: number;
  periodsTodayCount: number;
  todayCode: string;
  onQuickAddClick: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalTasks,
  completedTasks,
  pastDueRemindersCount,
  periodsTodayCount,
  todayCode,
  onQuickAddClick
}) => {
  const getDayName = (code: string) => {
    switch(code) {
      case "M": return "Monday";
      case "T": return "Tuesday";
      case "W": return "Wednesday";
      case "Th": return "Thursday";
      case "F": return "Friday";
      default: return code;
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Today's Reminders" 
        count={totalTasks} 
        subtitle={`${completedTasks} completed`}
        icon="calendar"
        progress={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
      />
      
      <StatCard 
        title="Past Due" 
        count={pastDueRemindersCount} 
        subtitle={pastDueRemindersCount > 0 ? "Need attention" : "All caught up!"}
        icon="alert-triangle"
        variant={pastDueRemindersCount > 0 ? "warning" : "success"}
      />
      
      <StatCard 
        title="Periods Today" 
        count={periodsTodayCount} 
        subtitle={periodsTodayCount > 0 ? getDayName(todayCode) : "No school today"}
        icon="clock"
      />
      
      <StatCard 
        title="Quick Add" 
        value="+"
        subtitle="Create a reminder"
        icon="plus-circle"
        variant="primary"
        onClick={onQuickAddClick}
      />
    </div>
  );
};

export default DashboardStats;
