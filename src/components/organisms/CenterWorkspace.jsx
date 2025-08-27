import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import RatingControls from '@/components/molecules/RatingControls';
import { cn } from '@/utils/cn';

const CenterWorkspace = ({
  mode,
  currentImage,
  selectedImages,
  images,
  currentImageIndex,
  onImageChange,
  onImageSelect
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      onImageChange(currentImageIndex - 1);
      handleZoomReset();
    }
  }, [currentImageIndex, onImageChange, handleZoomReset]);

  const handleNext = useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      onImageChange(currentImageIndex + 1);
      handleZoomReset();
    }
  }, [currentImageIndex, images.length, onImageChange, handleZoomReset]);

  const renderGalleryMode = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {currentImage && (
        <>
          {/* Main Image */}
          <motion.div
            key={currentImage.Id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-full max-h-full"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`
            }}
          >
            <img
              src={currentImage.proofingUrl || currentImage.proofing_url_c || currentImage.originalUrl || currentImage.original_url_c || '/api/placeholder/800/600'}
              alt={currentImage.Name}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Navigation Controls */}
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              disabled={currentImageIndex === 0}
              className="pointer-events-auto m-4 bg-black/50 text-white hover:bg-black/70"
            >
              <ApperIcon name="ChevronLeft" size={24} />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              disabled={currentImageIndex === images.length - 1}
              className="pointer-events-auto m-4 bg-black/50 text-white hover:bg-black/70"
            >
              <ApperIcon name="ChevronRight" size={24} />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ApperIcon name="ZoomOut" size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomReset}
            >
              {Math.round(zoomLevel * 100)}%
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
            >
              <ApperIcon name="ZoomIn" size={16} />
            </Button>
          </div>

          {/* Quick Rating */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <RatingControls
              rating={currentImage.rating}
              onRatingChange={(rating) => onImageSelect(currentImage, rating)}
              compact
            />
          </div>
        </>
      )}
    </div>
  );

  const renderCompareMode = () => (
    <div className="w-full h-full bg-gray-100 p-4">
      {selectedImages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <ApperIcon name="Eye" size={48} className="mx-auto mb-4" />
            <p className="text-lg font-medium">Select images to compare</p>
            <p className="text-sm">Choose 2-6 images from the gallery</p>
          </div>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4 h-full",
          selectedImages.length <= 2 && "grid-cols-2",
          selectedImages.length === 3 && "grid-cols-3",
          selectedImages.length === 4 && "grid-cols-2 grid-rows-2",
          selectedImages.length > 4 && "grid-cols-3 grid-rows-2"
        )}>
          {selectedImages.map((image, index) => (
            <motion.div
              key={image.Id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white rounded-lg overflow-hidden shadow-sm border"
            >
              <img
                src={image.proofingUrl || image.proofing_url_c || image.originalUrl || image.original_url_c || '/api/placeholder/400/300'}
                alt={image.Name}
                className="w-full h-full object-contain"
              />
              
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onImageSelect(image)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <ApperIcon name="X" size={14} />
                </Button>
              </div>
              
              <div className="absolute bottom-2 left-2 right-2">
                <RatingControls
                  rating={image.rating}
                  onRatingChange={(rating) => onImageSelect(image, rating)}
                  compact
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSlideshowMode = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <AnimatePresence mode="wait">
        {currentImage && (
          <motion.img
            key={currentImage.Id}
            src={currentImage.originalUrl || currentImage.original_url_c || '/api/placeholder/800/600'}
            alt={currentImage.Name}
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Slideshow Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/70 rounded-full px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentImageIndex === 0}
          className="text-white hover:text-gray-300"
        >
          <ApperIcon name="SkipBack" size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-gray-300"
        >
          <ApperIcon name="Pause" size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentImageIndex === images.length - 1}
          className="text-white hover:text-gray-300"
        >
          <ApperIcon name="SkipForward" size={16} />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{
            width: `${((currentImageIndex + 1) / images.length) * 100}%`
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'gallery' && renderGalleryMode()}
        {mode === 'compare' && renderCompareMode()}
        {mode === 'slideshow' && renderSlideshowMode()}
      </div>
    </div>
  );
};

export default CenterWorkspace;