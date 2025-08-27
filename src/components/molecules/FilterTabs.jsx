import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';

const FilterTabs = ({ activeFilter, onFilterChange, counts, compact = false }) => {
  const filters = [
    { id: 'all', label: 'All', icon: 'Images' },
    { id: 'yes', label: 'Yes', icon: 'ThumbsUp', color: 'success' },
    { id: 'maybe', label: 'Maybe', icon: 'Minus', color: 'warning' },
    { id: 'no', label: 'No', icon: 'ThumbsDown', color: 'error' },
    { id: 'unrated', label: 'Unrated', icon: 'CircleDot', color: 'default' }
  ];

  if (compact) {
    return (
      <div className="space-y-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-all",
              activeFilter === filter.id
                ? "bg-accent text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name={filter.icon} size={14} />
              <span>{filter.label}</span>
            </div>
            <Badge 
              variant={activeFilter === filter.id ? 'default' : 'secondary'}
              className="text-xs"
            >
              {counts[filter.id] || 0}
            </Badge>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            activeFilter === filter.id
              ? "bg-accent text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <ApperIcon name={filter.icon} size={14} />
          <span>{filter.label}</span>
          <Badge 
            variant={activeFilter === filter.id ? 'default' : 'secondary'}
            className="text-xs bg-white/20"
          >
            {counts[filter.id] || 0}
          </Badge>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;