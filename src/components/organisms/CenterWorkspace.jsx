import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import RatingControls from "@/components/molecules/RatingControls";
import Button from "@/components/atoms/Button";

const CenterWorkspace = ({
mode,
  currentImage,
  selectedImages,
  images,
  currentImageIndex,
  onImageChange,
  onImageSelect,
  // Wall Designer props
  currentRoomPhoto,
  roomPhotos,
  wallDesigns,
  currentWallDesign,
  imagePlacements,
  roomCalibration,
  onRoomPhotoSelect,
  onWallDesignSelect,
  onImagePlacementChange,
  onLoadImagePlacements,
  onLoadRoomCalibration
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Wall Designer state
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [showCropTools, setShowCropTools] = useState(false);
  const [cropMode, setCropMode] = useState('free'); // 'free', 'square', 'maintain-ratio'
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
const renderWallDesignerMode = () => {
    if (!currentRoomPhoto) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <ApperIcon name="Camera" size={48} className="text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-primary">No Room Photo Selected</h3>
              <p className="text-gray-600">Upload a room photo to start designing wall art layouts</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full relative bg-gray-100">
        {/* Wall Designer Canvas */}
        <div 
          className="h-full relative overflow-hidden cursor-crosshair"
          onDrop={(e) => {
            e.preventDefault();
            try {
              const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Create new image placement
              const newPlacement = {
                image_id_c: imageData.Id,
                x_coordinate_c: x,
                y_coordinate_c: y,
                width_c: 200, // Default width
                height_c: 150, // Default height
                crop_details_c: JSON.stringify({
                  x: 0, y: 0, width: 1, height: 1, // Full image initially
                  blackWhite: false,
                  rotation: 0
                })
};
              
              onImagePlacementChange(prev => [...prev, { ...newPlacement, tempId: Date.now(), imageData }]);
            } catch (error) {
              console.error('Error parsing dropped image data:', error);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Room Photo Background */}
          <img
            src={currentRoomPhoto.image_url_c}
            alt="Room"
            className="w-full h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          />

          {/* A4 Calibration Overlay */}
          {roomCalibration && (
            <div
              className="absolute border-2 border-red-500 border-dashed bg-red-500/10"
              style={{
                left: roomCalibration.translation_c || 50,
                top: 100,
                width: 210 * (roomCalibration.calibration_scale_c || 1), // A4 width in pixels
                height: 297 * (roomCalibration.calibration_scale_c || 1), // A4 height in pixels
                transform: `rotate(${roomCalibration.rotation_c || 0}deg)`
              }}
            >
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                A4 Reference
              </div>
            </div>
          )}

          {/* Image Placements */}
          {imagePlacements.map((placement, index) => {
            const cropDetails = placement.crop_details_c ? JSON.parse(placement.crop_details_c) : {};
            const isSelected = selectedPlacement?.tempId === placement.tempId || selectedPlacement?.Id === placement.Id;
            
            return (
              <div
                key={placement.tempId || placement.Id}
                className={cn(
                  "absolute border-2 cursor-move group",
                  isSelected ? "border-accent shadow-lg" : "border-white/80 hover:border-accent/50"
                )}
                style={{
                  left: placement.x_coordinate_c,
                  top: placement.y_coordinate_c,
                  width: placement.width_c,
                  height: placement.height_c,
                  transform: `rotate(${cropDetails.rotation || 0}deg)`
                }}
                onClick={() => setSelectedPlacement(placement)}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsDragging(true);
                    setSelectedPlacement(placement);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDragOffset({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }
                }}
              >
                <img
                  src={placement.imageData?.thumbnail_url_c || placement.imageData?.proofing_url_c}
                  alt="Placed artwork"
                  className={cn(
                    "w-full h-full object-cover",
                    cropDetails.blackWhite && "filter grayscale"
                  )}
                  style={{
                    clipPath: cropDetails.width < 1 || cropDetails.height < 1 
                      ? `inset(${cropDetails.y * 100}% ${(1 - cropDetails.x - cropDetails.width) * 100}% ${(1 - cropDetails.y - cropDetails.height) * 100}% ${cropDetails.x * 100}%)`
                      : undefined
                  }}
                />

                {/* Resize Handles */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-nw-resize" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-ne-resize" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-sw-resize" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-se-resize" />
                  </>
                )}

                {/* Toolbar */}
                {isSelected && (
                  <div className="absolute -top-12 left-0 bg-white shadow-lg rounded-lg border flex">
                    <button
                      onClick={() => {
                        const newCropDetails = { ...cropDetails, blackWhite: !cropDetails.blackWhite };
                        const updatedPlacement = {
                          ...placement,
crop_details_c: JSON.stringify(newCropDetails)
                        };
                        onImagePlacementChange(prev => prev.map(p => 
                          (p.tempId === placement.tempId || p.Id === placement.Id) ? updatedPlacement : p
                        ));
                      }}
                      className={cn(
                        "p-2 border-r hover:bg-gray-50",
                        cropDetails.blackWhite && "bg-gray-100"
                      )}
                      title="Toggle B&W"
                    >
                      <ApperIcon name="Palette" size={14} />
                    </button>
                    <button
                      onClick={() => setShowCropTools(!showCropTools)}
                      className="p-2 border-r hover:bg-gray-50"
                      title="Crop Tools"
                    >
                      <ApperIcon name="Crop" size={14} />
                    </button>
<button
                      onClick={() => {
                        onImagePlacementChange(prev => prev.filter(p => 
                          p.tempId !== placement.tempId && p.Id !== placement.Id
                        ));
                        setSelectedPlacement(null);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50"
                      title="Remove"
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Drop Zone Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm opacity-0 transition-opacity pointer-events-none">
            Drop images here to add to wall design
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <ApperIcon name="ZoomIn" size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <ApperIcon name="ZoomOut" size={16} />
          </button>
          <button
            onClick={handleZoomReset}
            className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <ApperIcon name="RotateCcw" size={16} />
          </button>
        </div>

        {/* Crop Tools Panel */}
        {showCropTools && selectedPlacement && (
          <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-primary">Crop Tools</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setCropMode('free')}
                className={cn(
                  "px-3 py-1 text-sm rounded",
                  cropMode === 'free' ? "bg-accent text-white" : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                Free Form
              </button>
              <button
                onClick={() => setCropMode('square')}
                className={cn(
                  "px-3 py-1 text-sm rounded",
                  cropMode === 'square' ? "bg-accent text-white" : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                Square
              </button>
              <button
                onClick={() => setCropMode('maintain-ratio')}
                className={cn(
                  "px-3 py-1 text-sm rounded",
                  cropMode === 'maintain-ratio' ? "bg-accent text-white" : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                Maintain Ratio
              </button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowCropTools(false)}>
                Apply Crop
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCropTools(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
};

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'gallery' && renderGalleryMode()}
        {mode === 'compare' && renderCompareMode()}
        {mode === 'slideshow' && renderSlideshowMode()}
        {mode === 'wall-designer' && renderWallDesignerMode()}
      </div>
    </div>
  );
};

export default CenterWorkspace;