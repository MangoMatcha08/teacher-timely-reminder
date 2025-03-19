
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

  // Parse initial value on component mount or when value prop changes
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
      const formattedMinutes = m || "00"; // Use empty minutes as "00"
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
    
    // Auto-switch to PM for afternoon hours (12 should be PM)
    if (num === 12 || (num >= 1 && num <= 5)) {
      setPeriod("PM");
    } else if (num >= 7 && num <= 11) {
      setPeriod("AM");
    }
    
    setHours(h);
    updateTime(h, minutes, period);
  };

  // Handle minutes change
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = e.target.value.replace(/\D/g, "");
    
    // Always update the internal state
    setMinutes(m);
    
    // Always update the parent component with the current value
    // This ensures we can type new values after deleting
    updateTime(hours, m, period);
  };

  // Handle minutes blur to format properly when focus leaves
  const handleMinutesBlur = () => {
    // If minutes is empty or invalid when leaving the field, set it to "00"
    if (minutes === "" || isNaN(parseInt(minutes, 10))) {
      setMinutes("00");
      updateTime(hours, "00", period);
      return;
    }
    
    // Ensure minutes are valid (0-59)
    let mins = parseInt(minutes, 10);
    if (mins > 59) mins = 59;
    
    // Format with leading zero
    const formattedMinutes = mins.toString().padStart(2, "0");
    setMinutes(formattedMinutes);
    updateTime(hours, formattedMinutes, period);
  };

  // Toggle AM/PM
  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);
    updateTime(hours, minutes, newPeriod);
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
