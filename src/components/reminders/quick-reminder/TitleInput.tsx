
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
        Title
      </label>
      <input
        id="quick-title"
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue ${
          errors.title ? "border-destructive" : "border-input"
        }`}
        placeholder="What do you need to remember?"
        {...register("title")}
      />
      <FormError error={errors.title} />
    </div>
  );
};

export default TitleInput;
