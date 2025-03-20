
import React from 'react';
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import Button from "@/components/shared/Button";

interface CategorySetupProps {
  categories: string[];
  updateCategory: (index: number, value: string) => void;
  removeCategory: (index: number) => void;
  addCategory: () => void;
}

const CategorySetup: React.FC<CategorySetupProps> = ({
  categories,
  updateCategory,
  removeCategory,
  addCategory
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">Reminder Categories</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Create categories to help organize your reminders.
        </p>
        
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-3 border rounded-lg p-4 bg-white">
              <div className="flex-1">
                <Input
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  className="w-full"
                  placeholder="Category Name"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeCategory(index)}
                className="text-destructive hover:text-destructive/90"
                disabled={categories.length === 1}
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
            onClick={addCategory}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Category
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategorySetup;
