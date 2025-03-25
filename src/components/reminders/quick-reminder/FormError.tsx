
import React from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type FormErrorProps = {
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  message?: string;
};

export const FormError: React.FC<FormErrorProps> = ({ error, message }) => {
  if (!error && !message) return null;
  
  const errorMessage = message || error?.message?.toString();
  
  return (
    <p className="mt-1 text-sm text-red-500">
      {errorMessage}
    </p>
  );
};

export default FormError;
