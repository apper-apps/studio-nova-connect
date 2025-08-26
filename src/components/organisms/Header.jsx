import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Header = ({ title, onMenuClick, actions, className }) => {
  return (
    <header className={cn(
      "bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between",
      className
    )}>
      <div className="flex items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden mr-3"
          onClick={onMenuClick}
        >
          <ApperIcon name="Menu" size={24} />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
};

export default Header;