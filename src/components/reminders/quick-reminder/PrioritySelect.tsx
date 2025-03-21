
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ReminderPriority } from "@/context/ReminderContext";
import { getPriorityIcon } from "./PriorityIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PrioritySelect: React.FC = () => {
  const { control } = useFormContext();

  return (
    <div>
      <label
        htmlFor="quick-priority"
        className="block text-sm font-medium text-foreground mb-2"
      >
        Priority
      </label>
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <Select 
            value={field.value} 
            onValueChange={field.onChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(field.value as ReminderPriority)}
                  <span>{field.value}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-green-500" />
                  <span>Low</span>
                </div>
              </SelectItem>
              <SelectItem value="Medium">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-amber-500" />
                  <span>Medium</span>
                </div>
              </SelectItem>
              <SelectItem value="High">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-red-500" />
                  <span>High</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
};

export default PrioritySelect;
