import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FilterTabs from '@/components/molecules/FilterTabs';
import { cn } from '@/utils/cn';

const LeftTray = ({
  mode,
  gallery,
  images,
  roomPhotos,
  currentImageIndex,
  onImageSelect,
  collapsed,
  onToggleCollapse,
  activeFilter,
  onFilterChange
}) => {
const counts = {
    all: images.length,
    yes: images.filter(img => img.rating_c === 'yes').length,
    maybe: images.filter(img => img.rating_c === 'maybe').length,
    no: images.filter(img => img.rating_c === 'no').length,
    unrated: images.filter(img => !img.rating_c || img.rating_c === 'unrated').length
  };

  // For Wall Designer mode, show only "Yes" and "Maybe" images
  const wallDesignerImages = mode === 'wall-designer' 
    ? images.filter(img => img.rating_c === 'yes' || img.rating_c === 'maybe')
    : images;

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
{mode === 'wall-designer' ? (
                <div className="space-y-4">
                  {/* Room Photos Section */}
                  {roomPhotos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Room Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {roomPhotos.map((roomPhoto) => (
                          <motion.div
                            key={roomPhoto.Id}
                            className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-gray-300 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                          >
                            <img
                              src={roomPhoto.image_url_c || '/api/placeholder/160/120'}
                              alt={roomPhoto.Name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded">
                              {roomPhoto.Name}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Wall Designer Image Library */}
                  <div>
                    <h4 className="font-medium text-sm text-primary mb-2">
                      Selected Images ({wallDesignerImages.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {wallDesignerImages.map((image, index) => (
                        <motion.div
                          key={image.Id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(image));
                          }}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all cursor-grab active:cursor-grabbing",
                            "border-transparent hover:border-accent/50"
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={image.thumbnail_url_c || '/api/placeholder/120/120'}
                            alt={image.Name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          
                          {/* Rating indicator */}
                          <div className={cn(
                            "absolute top-1 right-1 w-3 h-3 rounded-full border border-white",
                            image.rating_c === 'yes' && "bg-green-500",
                            image.rating_c === 'maybe' && "bg-yellow-500"
                          )} />

                          {/* Drag indicator */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <ApperIcon name="Move" size={16} className="text-white drop-shadow" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
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
                        src={image.thumbnail_url_c || '/api/placeholder/120/120'}
                        alt={image.Name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Rating indicator */}
                      {image.rating_c && image.rating_c !== 'unrated' && (
                        <div className={cn(
                          "absolute top-1 right-1 w-3 h-3 rounded-full border border-white",
                          image.rating_c === 'yes' && "bg-green-500",
                          image.rating_c === 'maybe' && "bg-yellow-500",
                          image.rating_c === 'no' && "bg-red-500"
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeftTray;