
import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/shared/Card";

interface StatCardProps {
  title: string;
  count?: number;
  icon: React.ReactNode;
  iconBg: string;
  to?: string;
  customContent?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  count, 
  icon, 
  iconBg, 
  to, 
  customContent 
}) => {
  const content = (
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div className={`${iconBg} p-2 rounded-full`}>
          {icon}
        </div>
        {count !== undefined && (
          <span className="text-2xl font-semibold">{count}</span>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-muted-foreground">{title}</h3>
      {customContent}
    </div>
  );

  if (to) {
    return (
      <Link to={to}>
        <Card className="transition-all hover:shadow-md cursor-pointer">
          {content}
        </Card>
      </Link>
    );
  }

  return <Card>{content}</Card>;
};

export default StatCard;
