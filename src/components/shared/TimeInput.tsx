
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  className?: string;
  error?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  label,
  id,
  className,
  error,
}) => {
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Parse initial value on component mount
  useEffect(() => {
    if (value) {
      try {
        const [time, meridian] = value.split(" ");
        const [hourStr, minStr] = time.split(":");
        
        setHours(hourStr);
        setMinutes(minStr);
        setPeriod(meridian as "AM" | "PM");
      } catch (e) {
        // If parsing fails, use default values
        setHours("12");
        setMinutes("00");
        setPeriod("AM");
      }
    }
  }, [value]);

  // Combine values and call onChange
  const updateTime = (h: string, m: string, p: "AM" | "PM") => {
    // Only update if we have valid hours
    if (h) {
      // If minutes are empty, default to "00" when updating parent
      const formattedMinutes = m || "00";
      onChange(`${h}:${formattedMinutes} ${p}`);
    }
  };

  // Handle hours change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let h = e.target.value.replace(/\D/g, "");
    
    // Handle empty input
    if (h === "") {
      setHours("");
      return;
    }
    
    // Convert to number and validate
    let num = parseInt(h, 10);
    if (isNaN(num)) num = 12;
    
    // Ensure hours are between 1 and 12
    if (num < 1) num = 1;
    if (num > 12) num = 12;
    
    // Format to string
    h = num.toString();
    
    setHours(h);
    updateTime(h, minutes, period);
  };

  // Handle minutes change
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let m = e.target.value.replace(/\D/g, "");
    
    // Handle empty input - allow this state temporarily
    if (m === "") {
      setMinutes("");
      // Don't call updateTime here to allow the field to be empty
      return;
    }
    
    // Convert to number and validate
    let num = parseInt(m, 10);
    if (isNaN(num)) num = 0;
    
    // Ensure minutes are between 0 and 59
    if (num < 0) num = 0;
    if (num > 59) num = 59;
    
    // Format to string with leading zero if needed
    m = num.toString().padStart(2, "0");
    
    setMinutes(m);
    updateTime(hours, m, period);
  };

  // Handle minutes blur to format properly when focus leaves
  const handleMinutesBlur = () => {
    // If minutes is empty when leaving the field, set it to "00"
    if (minutes === "") {
      setMinutes("00");
      updateTime(hours, "00", period);
    }
  };

  // Toggle AM/PM
  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);
    updateTime(hours, minutes || "00", newPeriod);
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground mb-2"
        >
          {label}
        </label>
      )}
      <div className="flex items-center">
        <div className="flex items-center justify-between rounded-l-lg border border-r-0 px-3 py-2 w-16">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full text-center focus:outline-none bg-transparent"
            placeholder="12"
            value={hours}
            onChange={handleHoursChange}
            maxLength={2}
          />
        </div>
        <div className="flex items-center justify-between border border-x-0 px-1 py-2">
          <span className="text-center">:</span>
        </div>
        <div className="flex items-center justify-between border border-l-0 px-3 py-2 w-16">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full text-center focus:outline-none bg-transparent"
            placeholder="00"
            value={minutes}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
            maxLength={2}
          />
        </div>
        <button
          type="button"
          onClick={togglePeriod}
          className={cn(
            "inline-flex items-center justify-center rounded-r-lg border border-l-0 px-3 py-2 h-[42px] w-16 text-sm font-medium transition-colors",
            period === "AM"
              ? "bg-teacher-gray text-teacher-darkGray"
              : "bg-teacher-blue text-white"
          )}
        >
          {period}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default TimeInput;
