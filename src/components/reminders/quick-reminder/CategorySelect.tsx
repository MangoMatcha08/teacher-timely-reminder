
import React from "react";
import { useFormContext } from "react-hook-form";

const CategorySelect: React.FC = () => {
  const { register, watch } = useFormContext();

  return (
    <div>
      <label
        htmlFor="quick-category"
        className="block text-sm font-medium text-foreground mb-2"
      >
        Category (Optional)
      </label>
      <select
        id="quick-category"
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
        {...register("category")}
      >
        <option value="">Select a category</option>
        {watch("schoolSetup")?.categories?.map((category: string, index: number) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;
