import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const RatingControls = ({ 
  rating, 
  onRatingChange, 
  compact = false, 
  showLabels = false 
}) => {
  const ratings = [
    { value: 'yes', label: 'Yes', icon: 'ThumbsUp', color: 'success' },
    { value: 'maybe', label: 'Maybe', icon: 'Minus', color: 'warning' },
    { value: 'no', label: 'No', icon: 'ThumbsDown', color: 'error' }
  ];

  const handleRatingClick = (ratingValue) => {
    // Toggle rating - if same rating is clicked, unrate it
    const newRating = rating === ratingValue ? 'unrated' : ratingValue;
    onRatingChange(newRating);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
        {ratings.map((r) => (
          <Button
            key={r.value}
            variant="ghost"
            size="sm"
            onClick={() => handleRatingClick(r.value)}
            className={cn(
              "w-8 h-8 p-0 rounded-full transition-all",
              rating === r.value
                ? r.color === 'success' ? "bg-green-500 text-white" :
                  r.color === 'warning' ? "bg-yellow-500 text-white" :
                  r.color === 'error' ? "bg-red-500 text-white" : "bg-gray-500 text-white"
                : "text-white/70 hover:text-white hover:bg-white/20"
            )}
          >
            <ApperIcon name={r.icon} size={14} />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="text-center text-sm font-medium text-gray-700">
          Rate this image
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2">
        {ratings.map((r) => (
          <Button
            key={r.value}
            variant={rating === r.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleRatingClick(r.value)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 h-auto transition-all",
              rating === r.value && (
                r.color === 'success' ? "bg-green-500 border-green-500 hover:bg-green-600" :
                r.color === 'warning' ? "bg-yellow-500 border-yellow-500 hover:bg-yellow-600" :
                r.color === 'error' ? "bg-red-500 border-red-500 hover:bg-red-600" : ""
              )
            )}
          >
            <ApperIcon name={r.icon} size={16} />
            {showLabels && (
              <span className="text-xs">{r.label}</span>
            )}
          </Button>
        ))}
      </div>

      {rating && rating !== 'unrated' && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRatingClick('unrated')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear Rating
          </Button>
        </div>
      )}
    </div>
  );
};

export default RatingControls;