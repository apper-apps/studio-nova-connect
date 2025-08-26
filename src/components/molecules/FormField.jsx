import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  error, 
  required, 
  className, 
  inputClassName,
  ...inputProps 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={required ? "after:content-['*'] after:text-error after:ml-1" : ""}>
        {label}
      </Label>
      <Input 
        className={cn(
          error && "border-error focus:border-error focus:ring-error/20",
          inputClassName
        )}
        {...inputProps}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default FormField;