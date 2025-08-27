import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const FooterBar = ({
  mode,
  currentImage,
  selectedImages,
  totalImages,
  currentIndex
}) => {
  const renderGalleryInfo = () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ApperIcon name="Image" size={16} className="text-gray-600" />
        <span className="text-sm text-gray-700">
          {currentIndex + 1} of {totalImages}
        </span>
      </div>

      {currentImage && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{currentImage.Name}</span>
            {currentImage.rating && currentImage.rating !== 'unrated' && (
              <Badge variant={
                currentImage.rating === 'yes' ? 'success' :
                currentImage.rating === 'maybe' ? 'warning' :
                currentImage.rating === 'no' ? 'error' : 'default'
              }>
                {currentImage.rating}
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCompareInfo = () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ApperIcon name="Eye" size={16} className="text-gray-600" />
        <span className="text-sm text-gray-700">
          {selectedImages.length} images selected
        </span>
      </div>

      {selectedImages.length > 0 && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1">
            {selectedImages.slice(0, 3).map((image, index) => (
              <div
                key={image.Id}
                className="w-6 h-6 rounded bg-gray-200 border border-gray-300 overflow-hidden"
              >
                <img
                  src={image.thumbnailUrl || image.thumbnail_url_c || '/api/placeholder/24/24'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {selectedImages.length > 3 && (
              <div className="w-6 h-6 rounded bg-gray-100 border border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-600">+{selectedImages.length - 3}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderSlideshowInfo = () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ApperIcon name="Play" size={16} className="text-gray-600" />
        <span className="text-sm text-gray-700">Slideshow Mode</span>
      </div>

      <div className="w-px h-4 bg-gray-300" />
      
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {currentIndex + 1} / {totalImages}
        </span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / totalImages) * 100}%`
            }}
          />
        </div>
      </div>

      {currentImage && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-sm font-medium">{currentImage.Name}</span>
        </>
      )}
    </div>
  );

  const renderQuickActions = () => (
    <div className="flex items-center gap-2">
      {mode === 'gallery' && (
        <>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Download" size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Heart" size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <ApperIcon name="ShoppingCart" size={14} />
          </Button>
        </>
      )}

      {mode === 'compare' && selectedImages.length > 0 && (
        <>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Download" size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <ApperIcon name="ShoppingCart" size={14} />
          </Button>
        </>
      )}

      {mode === 'slideshow' && (
        <>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Pause" size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Square" size={14} />
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex-1">
        {mode === 'gallery' && renderGalleryInfo()}
        {mode === 'compare' && renderCompareInfo()}
        {mode === 'slideshow' && renderSlideshowInfo()}
      </div>

      <div className="flex items-center gap-4">
        {renderQuickActions()}
      </div>
    </div>
  );
};

export default FooterBar;