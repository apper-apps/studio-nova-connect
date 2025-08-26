import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const RatingControls = ({ 
  rating, 
  onRatingChange, 
  size = "default",
  className 
}) => {
  const ratings = [
    { value: "yes", icon: "Smile", color: "bg-success hover:bg-success/90", label: "Yes" },
    { value: "maybe", icon: "Meh", color: "bg-warning hover:bg-warning/90", label: "Maybe" },
    { value: "no", icon: "Frown", color: "bg-error hover:bg-error/90", label: "No" }
  ];

  const sizes = {
    sm: "w-8 h-8",
    default: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: 16,
    default: 20,
    lg: 24
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {ratings.map((ratingOption) => (
        <Button
          key={ratingOption.value}
          variant="ghost"
          size="sm"
          onClick={() => onRatingChange(ratingOption.value)}
          className={cn(
            "p-0 rounded-full transition-all duration-200 transform hover:scale-110",
            sizes[size],
            rating === ratingOption.value ? ratingOption.color : "hover:bg-gray-100"
          )}
          title={ratingOption.label}
        >
          <ApperIcon 
            name={ratingOption.icon} 
            size={iconSizes[size]} 
            className={rating === ratingOption.value ? "text-white" : "text-gray-600"}
          />
        </Button>
      ))}
    </div>
  );
};

export default RatingControls;