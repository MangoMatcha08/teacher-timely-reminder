
import React from "react";
import { X } from "lucide-react";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";

interface QuickReminderModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const QuickReminderModal: React.FC<QuickReminderModalProps> = ({ 
  title, 
  onClose, 
  onSubmit, 
  children 
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        <Card>
          <CardHeader className="relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6"
            >
              <X className="h-4 w-4" />
            </button>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          
          <form onSubmit={onSubmit}>
            <CardContent>
              {children}
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2 border-t p-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default QuickReminderModal;
