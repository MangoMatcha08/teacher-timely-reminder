
import React from "react";

export const FormError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <p className="mt-1 text-sm text-red-500">
      {message}
    </p>
  );
};

export default FormError;
