
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { SchoolSetup, Reminder } from "@/context/ReminderContext";

interface ReminderCardProps {
  reminder: Reminder;
  schoolSetup: SchoolSetup | null;
}

const ReminderCard = ({ reminder, schoolSetup }: ReminderCardProps) => {
  return (
    <Card key={reminder.id} className="overflow-hidden">
      <CardHeader className="py-2 px-3 bg-gray-50 border-b">
        <CardTitle className="text-sm font-medium">{reminder.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-xs">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{reminder.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timing:</span>
            <span>{reminder.timing}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days:</span>
            <span>{reminder.days.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Period:</span>
            <span>
              {schoolSetup?.periods.find(p => p.id === reminder.periodId)?.name || "N/A"}
            </span>
          </div>
          {reminder.category && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span>{reminder.category}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Priority:</span>
            <span>{reminder.priority}</span>
          </div>
          {reminder.notes && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-muted-foreground mb-1">Notes:</p>
              <p className="text-xs">{reminder.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;
