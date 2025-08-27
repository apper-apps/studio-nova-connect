import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const BulkActionsToolbar = ({ 
  selectedCount = 0, 
  onBulkRating, 
  onClearSelection,
  onExport,
  className 
}) => {
  const ratings = [
    { value: 'yes', label: 'Yes', icon: 'ThumbsUp', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'maybe', label: 'Maybe', icon: 'Minus', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'no', label: 'No', icon: 'ThumbsDown', color: 'bg-red-500 hover:bg-red-600' }
  ];

  const handleBulkRating = (rating) => {
    onBulkRating(rating);
  };

  const handleClearSelection = () => {
    if (window.confirm(`Clear selection of ${selectedCount} image${selectedCount === 1 ? '' : 's'}?`)) {
      onClearSelection();
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 bg-accent/10 dark:bg-accent-dark/10 border border-accent/20 dark:border-accent-dark/20 rounded-lg",
      className
    )}>
      {/* Selection Info */}
      <div className="flex items-center gap-2">
        <ApperIcon name="CheckSquare" size={16} className="text-accent dark:text-accent-dark" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedCount} image{selectedCount === 1 ? '' : 's'} selected
        </span>
      </div>

      {/* Rating Actions */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Rate as:
        </span>
        {ratings.map((rating) => (
          <Button
            key={rating.value}
            size="sm"
            onClick={() => handleBulkRating(rating.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-white border-0 transition-all duration-200",
              rating.color
            )}
          >
            <ApperIcon name={rating.icon} size={14} />
            <span className="text-xs font-medium">{rating.label}</span>
          </Button>
        ))}
      </div>

      {/* Clear Selection */}
<Button
        variant="outline"
        size="sm"
        onClick={() => onExport && onExport()}
        className="flex items-center gap-1.5 px-3 py-1.5"
      >
        <ApperIcon name="Download" size={14} />
        <span className="text-xs">Export</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearSelection}
        className="flex items-center gap-1.5 px-3 py-1.5 ml-auto"
      >
        <ApperIcon name="X" size={14} />
        <span className="text-xs">Clear</span>
      </Button>
    </div>
  );
};

export default BulkActionsToolbar;