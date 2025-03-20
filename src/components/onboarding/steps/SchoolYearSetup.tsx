
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

type TermType = "quarter" | "semester" | "year";

interface SchoolYearSetupProps {
  schoolYear: string;
  setSchoolYear: (year: string) => void;
  termType: TermType;
  setTermType: (type: TermType) => void;
  termName: string;
  setTermName: (name: string) => void;
  updateTermNameFromType: (type: TermType) => void;
}

const SchoolYearSetup: React.FC<SchoolYearSetupProps> = ({
  schoolYear,
  setSchoolYear,
  termType,
  setTermType,
  termName,
  setTermName,
  updateTermNameFromType
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">Set Up Your School Year</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your school year and select your term structure.
        </p>
        
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <div className="space-y-3">
            <label className="text-sm font-medium">School Year</label>
            <Input
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              placeholder="e.g., 2023-2024"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Format as YYYY-YYYY (e.g., 2023-2024)
            </p>
          </div>
          
          <div className="space-y-3 pt-4 border-t mt-4">
            <label className="text-sm font-medium">Term Structure</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTermType("quarter");
                  updateTermNameFromType("quarter");
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                  termType === "quarter" 
                    ? "bg-teacher-blue/10 border-teacher-blue" 
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-medium">Quarter</span>
                <span className="text-xs text-muted-foreground mt-1">3 months</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTermType("semester");
                  updateTermNameFromType("semester");
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                  termType === "semester" 
                    ? "bg-teacher-blue/10 border-teacher-blue" 
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-medium">Semester</span>
                <span className="text-xs text-muted-foreground mt-1">5 months</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTermType("year");
                  updateTermNameFromType("year");
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                  termType === "year" 
                    ? "bg-teacher-blue/10 border-teacher-blue" 
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-medium">Year-Round</span>
                <span className="text-xs text-muted-foreground mt-1">Full year</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t mt-4">
            <label className="text-sm font-medium">Term Name</label>
            <Select
              value={termName}
              onValueChange={setTermName}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select term name" />
              </SelectTrigger>
              <SelectContent>
                {termType === "quarter" ? (
                  <>
                    <SelectItem value="Quarter 1">Quarter 1</SelectItem>
                    <SelectItem value="Quarter 2">Quarter 2</SelectItem>
                    <SelectItem value="Quarter 3">Quarter 3</SelectItem>
                    <SelectItem value="Quarter 4">Quarter 4</SelectItem>
                  </>
                ) : termType === "semester" ? (
                  <>
                    <SelectItem value="Fall Semester">Fall Semester</SelectItem>
                    <SelectItem value="Spring Semester">Spring Semester</SelectItem>
                  </>
                ) : (
                  <SelectItem value="Full Year">Full Year</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-start mt-4 pt-4 border-t">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
            <p className="text-sm text-muted-foreground">
              You'll be able to create additional terms and switch between them after completing setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolYearSetup;
