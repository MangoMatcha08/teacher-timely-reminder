
import React from "react";
import { FieldError } from "react-hook-form";

interface FormErrorProps {
  error?: FieldError;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <p className="mt-1 text-sm text-destructive">
      {error.message}
    </p>
  );
};
