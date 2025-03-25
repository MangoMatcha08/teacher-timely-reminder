
import React from 'react';
import { Period } from "@/context/ReminderContext";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import Button from "@/components/shared/Button";

interface PeriodSetupProps {
  periods: Period[];
  handlePeriodNameChange: (id: string, name: string) => void;
  removePeriod: (id: string) => void;
  addPeriod: () => void;
}

const PeriodSetup: React.FC<PeriodSetupProps> = ({
  periods,
  handlePeriodNameChange,
  removePeriod,
  addPeriod
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">Create your class periods</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Create all the periods or classes you teach during the day.
          You'll select which days each period occurs on in the next steps.
        </p>
        
        <div className="space-y-4">
          {periods.map((period) => (
            <div key={period.id} className="flex items-center gap-3 border rounded-lg p-4 bg-white">
              <div className="flex-1">
                <Input
                  value={period.name}
                  onChange={(e) => handlePeriodNameChange(period.id, e.target.value)}
                  className="w-full"
                  placeholder="Period Name"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removePeriod(period.id)}
                className="text-destructive hover:text-destructive/90"
                disabled={periods.length === 1}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addPeriod}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Period
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeriodSetup;
