import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FilterTabs from '@/components/molecules/FilterTabs';
import { cn } from '@/utils/cn';

const LeftTray = ({
  gallery,
  images,
  currentImageIndex,
  onImageSelect,
  collapsed,
  onToggleCollapse,
  activeFilter,
  onFilterChange
}) => {
  const counts = {
    all: images.length,
    yes: images.filter(img => img.rating === 'yes').length,
    maybe: images.filter(img => img.rating === 'maybe').length,
    no: images.filter(img => img.rating === 'no').length,
    unrated: images.filter(img => !img.rating || img.rating === 'unrated').length
  };

  return (
    <div className={cn(
      "bg-surface-50 border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-12" : "w-80"
    )}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h3 className="font-semibold text-primary truncate">{gallery?.Name}</h3>
              <p className="text-xs text-gray-500">{images.length} images</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="flex-shrink-0"
        >
          <ApperIcon 
            name={collapsed ? "ChevronRight" : "ChevronLeft"} 
            size={16} 
          />
        </Button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Gallery Info */}
            <div className="p-3 border-b border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{gallery?.client_id_c?.Name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session:</span>
                  <span className="font-medium">
                    {gallery?.sessionDate ? new Date(gallery.sessionDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-gray-200">
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                counts={counts}
                compact
              />
            </div>

            {/* Thumbnails */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <motion.button
                    key={image.Id}
                    onClick={() => onImageSelect(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all",
                      index === currentImageIndex
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-transparent hover:border-gray-300"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image.thumbnailUrl || image.thumbnail_url_c || '/api/placeholder/120/120'}
                      alt={image.Name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Rating indicator */}
                    {image.rating && image.rating !== 'unrated' && (
                      <div className={cn(
                        "absolute top-1 right-1 w-3 h-3 rounded-full border border-white",
                        image.rating === 'yes' && "bg-green-500",
                        image.rating === 'maybe' && "bg-yellow-500",
                        image.rating === 'no' && "bg-red-500"
                      )} />
                    )}

                    {/* Current indicator */}
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                          <ApperIcon name="Eye" size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeftTray;