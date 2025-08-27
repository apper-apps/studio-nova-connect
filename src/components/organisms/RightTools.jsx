import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import RatingControls from '@/components/molecules/RatingControls';
import { cn } from '@/utils/cn';

const RightTools = ({
  mode,
  currentImage,
  selectedImages,
  onImageRating,
  onClearSelection,
  collapsed,
  onToggleCollapse
}) => {
  const [activeSection, setActiveSection] = useState('rating');

  const sections = [
    { id: 'rating', label: 'Rating', icon: 'Star' },
    { id: 'compare', label: 'Compare', icon: 'Eye' },
    { id: 'metadata', label: 'Details', icon: 'Info' },
    { id: 'actions', label: 'Actions', icon: 'Settings' }
  ];

  const renderRatingSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Image Rating</h4>
      
      {currentImage ? (
        <div className="space-y-3">
          <div className="text-center">
            <img
              src={currentImage.thumbnailUrl || currentImage.thumbnail_url_c || '/api/placeholder/120/120'}
              alt={currentImage.Name}
              className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
            />
            <p className="text-sm font-medium truncate">{currentImage.Name}</p>
          </div>

          <RatingControls
            rating={currentImage.rating}
            onRatingChange={(rating) => onImageRating(currentImage.Id, rating)}
            showLabels
          />

          <div className="pt-2 border-t border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant={
                currentImage.rating === 'yes' ? 'success' :
                currentImage.rating === 'maybe' ? 'warning' :
                currentImage.rating === 'no' ? 'error' : 'default'
              }>
                {currentImage.rating || 'Unrated'}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <ApperIcon name="Image" size={32} className="mx-auto mb-2" />
          <p className="text-sm">No image selected</p>
        </div>
      )}
    </div>
  );

  const renderCompareSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-primary">Comparison Queue</h4>
        <Badge variant="default">{selectedImages.length}</Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {selectedImages.map((image, index) => (
          <div
            key={image.Id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <img
              src={image.thumbnailUrl || image.thumbnail_url_c || '/api/placeholder/40/40'}
              alt={image.Name}
              className="w-10 h-10 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{image.Name}</p>
              <p className="text-xs text-gray-500">#{index + 1}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Remove from selection
                const newSelected = selectedImages.filter(img => img.Id !== image.Id);
                onClearSelection();
                // This would need to be handled by parent component
              }}
              className="text-red-500 hover:text-red-700"
            >
              <ApperIcon name="X" size={14} />
            </Button>
          </div>
        ))}
      </div>

      {selectedImages.length > 0 && (
        <div className="pt-2 border-t border-gray-200 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="w-full"
          >
            Clear All
          </Button>
          
          {selectedImages.length >= 2 && (
            <Button
              variant="default"
              size="sm"
              className="w-full"
            >
              <ApperIcon name="Eye" size={14} className="mr-1" />
              Compare Selected
            </Button>
          )}
        </div>
      )}

      {selectedImages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <ApperIcon name="Eye" size={32} className="mx-auto mb-2" />
          <p className="text-sm">No images selected</p>
          <p className="text-xs">Select images to compare</p>
        </div>
      )}
    </div>
  );

  const renderMetadataSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Image Details</h4>
      
      {currentImage ? (
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">File Name:</span>
            <p className="mt-1 break-words">{currentImage.Name}</p>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Order:</span>
            <p className="mt-1">#{currentImage.order || currentImage.order_c || 1}</p>
          </div>

          <div>
            <span className="font-medium text-gray-600">Rating:</span>
            <p className="mt-1 capitalize">{currentImage.rating || 'Unrated'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-600">Gallery:</span>
            <p className="mt-1">{currentImage.gallery_id_c?.Name || 'Unknown'}</p>
          </div>

          {currentImage.Tags && (
            <div>
              <span className="font-medium text-gray-600">Tags:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {currentImage.Tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <ApperIcon name="Info" size={32} className="mx-auto mb-2" />
          <p className="text-sm">No image selected</p>
        </div>
      )}
    </div>
  );

  const renderActionsSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Quick Actions</h4>
      
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={!currentImage}
        >
          <ApperIcon name="Download" size={14} className="mr-2" />
          Download Original
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={!currentImage}
        >
          <ApperIcon name="Share" size={14} className="mr-2" />
          Share Image
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={selectedImages.length === 0}
        >
          <ApperIcon name="ShoppingCart" size={14} className="mr-2" />
          Add to Cart
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={!currentImage}
        >
          <ApperIcon name="Heart" size={14} className="mr-2" />
          Add to Favorites
        </Button>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <ApperIcon name="Play" size={14} className="mr-2" />
          Start Slideshow
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "bg-white border-l border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-12" : "w-80"
    )}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <AnimatePresence>
          {!collapsed && (
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="font-semibold text-primary"
            >
              Tools
            </motion.h3>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="flex-shrink-0"
        >
          <ApperIcon 
            name={collapsed ? "ChevronLeft" : "ChevronRight"} 
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
            {/* Section Tabs */}
            <div className="flex border-b border-gray-200">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                    activeSection === section.id
                      ? "text-accent border-b-2 border-accent"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <ApperIcon name={section.icon} size={16} />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeSection === 'rating' && renderRatingSection()}
              {activeSection === 'compare' && renderCompareSection()}
              {activeSection === 'metadata' && renderMetadataSection()}
              {activeSection === 'actions' && renderActionsSection()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RightTools;