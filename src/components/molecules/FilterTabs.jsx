import React from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const FilterTabs = ({ 
  activeFilter, 
  onFilterChange, 
  counts = {},
  className 
}) => {
  const filters = [
    { key: "all", label: "All", variant: "outline" },
    { key: "yes", label: "Yes", variant: "success" },
    { key: "maybe", label: "Maybe", variant: "warning" },
    { key: "no", label: "No", variant: "error" },
    { key: "unrated", label: "Unrated", variant: "secondary" }
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? filter.variant : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className="flex items-center gap-2"
        >
          {filter.label}
          {counts[filter.key] > 0 && (
            <Badge variant="outline" className="text-xs">
              {counts[filter.key]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default FilterTabs;