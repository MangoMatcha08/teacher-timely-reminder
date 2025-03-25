
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormError } from "./FormError";

const TitleInput: React.FC = () => {
  const { 
    register, 
    formState: { errors } 
  } = useFormContext();

  return (
    <div>
      <label 
        htmlFor="quick-title" 
        className="block text-sm font-medium text-foreground mb-2"
      >
        What do you need to remember?
      </label>
      <input
        id="quick-title"
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue ${
          errors.title ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="E.g., Call parent about homework"
        {...register("title")}
      />
      {errors.title && <FormError error={errors.title} />}
    </div>
  );
};

export default TitleInput;
