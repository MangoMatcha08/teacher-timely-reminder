
import React from "react";
import { Calendar } from "lucide-react";

interface ScheduleHeaderProps {
  title: string;
  date?: string;
}

const ScheduleHeader = ({ title, date }: ScheduleHeaderProps) => {
  return (
    <div className="flex flex-col mb-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
      {date && (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{date}</span>
        </div>
      )}
    </div>
  );
};

export default ScheduleHeader;
