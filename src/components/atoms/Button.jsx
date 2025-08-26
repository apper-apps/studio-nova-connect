import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg",
    primary: "bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg",
    secondary: "bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-primary shadow-sm hover:shadow-md",
    ghost: "bg-transparent hover:bg-gray-100 text-primary shadow-none",
    success: "bg-success hover:bg-success/90 text-white shadow-md hover:shadow-lg",
    warning: "bg-warning hover:bg-warning/90 text-white shadow-md hover:shadow-lg",
    error: "bg-error hover:bg-error/90 text-white shadow-md hover:shadow-lg"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;