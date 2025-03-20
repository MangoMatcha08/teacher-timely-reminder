
import React from "react";
import Button from "@/components/shared/Button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScheduleHeaderProps {
  title: string;
}

const ScheduleHeader = ({ title }: ScheduleHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <Button 
        onClick={() => navigate("/create-reminder")}
        className="h-8 text-sm"
      >
        <Plus className="h-3 w-3 mr-1" />
        New Reminder
      </Button>
    </div>
  );
};

export default ScheduleHeader;
