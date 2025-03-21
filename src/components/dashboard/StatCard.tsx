
import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/shared/Card";

interface StatCardProps {
  title: string;
  count?: number;
  value?: number | string;
  subtitle?: string;
  icon: React.ReactNode | string;
  iconBg?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  progress?: number;
  to?: string;
  onClick?: () => void;
  customContent?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  count, 
  value,
  subtitle,
  icon, 
  iconBg = "bg-gray-100", 
  variant = "default",
  progress,
  to, 
  onClick,
  customContent 
}) => {
  // Generate background color based on variant
  let bgColor = "text-gray-700";
  let iconBackground = iconBg;
  
  if (variant === "primary") {
    bgColor = "text-blue-600";
    iconBackground = iconBg || "bg-blue-100";
  } else if (variant === "success") {
    bgColor = "text-green-600";
    iconBackground = iconBg || "bg-green-100";
  } else if (variant === "warning") {
    bgColor = "text-amber-600";
    iconBackground = iconBg || "bg-amber-100";
  } else if (variant === "danger") {
    bgColor = "text-red-600";
    iconBackground = iconBg || "bg-red-100";
  }

  const content = (
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div className={`${iconBackground} p-2 rounded-full`}>
          {typeof icon === 'string' ? (
            <div className={`${bgColor}`}>
              {icon === "calendar" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
              {icon === "alert-triangle" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>}
              {icon === "clock" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              {icon === "plus-circle" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>}
            </div>
          ) : (
            icon
          )}
        </div>
        {value !== undefined && (
          <span className="text-2xl font-semibold">{value}</span>
        )}
        {count !== undefined && (
          <span className="text-2xl font-semibold">{count}</span>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-muted-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {progress !== undefined && (
        <div className="mt-2">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teacher-blue" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {customContent}
    </div>
  );

  const cardClasses = `transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`;

  if (to) {
    return (
      <Link to={to}>
        <Card className={cardClasses}>
          {content}
        </Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Card className={cardClasses} onClick={onClick}>
        {content}
      </Card>
    );
  }

  return <Card>{content}</Card>;
};

export default StatCard;
