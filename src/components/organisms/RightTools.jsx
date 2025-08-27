import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import RatingControls from "@/components/molecules/RatingControls";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { toast } from "@/utils/toast";

const RightTools = ({
mode,
  currentImage,
  selectedImages,
  onImageRating,
  onClearSelection,
  collapsed,
  onToggleCollapse,
  // Wall Designer props
  gallery,
  roomPhotos,
  currentRoomPhoto,
  wallDesigns,
  currentWallDesign,
  imagePlacements,
  roomCalibration,
  onRoomPhotosChange,
  onWallDesignsChange,
  onRoomCalibrationChange,
  onLoadRoomPhotos,
  onLoadWallDesigns,
  // Additional callback props
  onRoomPhotoSelect,
  onWallDesignSelect,
  onLoadImagePlacements
}) => {
  const [activeSection, setActiveSection] = useState(mode === 'wall-designer' ? 'wall-tools' : 'rating');
  const [uploadingRoom, setUploadingRoom] = useState(false);
  const [calibratingRoom, setCalibratingRoom] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

const sections = mode === 'wall-designer' ? [
    { id: 'wall-tools', label: 'Wall Tools', icon: 'LayoutDashboard' },
    { id: 'templates', label: 'Templates', icon: 'Save' },
    { id: 'calibration', label: 'Calibration', icon: 'Ruler' },
    { id: 'order', label: 'Add to Order', icon: 'ShoppingCart' }
  ] : [
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

  // Wall Designer Sections
  const renderWallToolsSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Room Setup</h4>
      
      <div className="space-y-2">
        <label className="block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file || !gallery) return;
              
              setUploadingRoom(true);
              try {
                // In a real implementation, you would upload to a file service
                const roomPhotoData = {
                  Name: `Room Photo ${Date.now()}`,
                  image_url_c: URL.createObjectURL(file), // Temporary URL
                  client_id_c: gallery.client_id_c,
                  gallery_id_c: gallery.Id
                };
                
                // Create room photo record
                const roomPhotoService = await import('@/services/api/roomPhotoService');
                const newRoomPhoto = await roomPhotoService.default.create(roomPhotoData);
                
                onRoomPhotosChange(prev => [...prev, newRoomPhoto]);
                toast.success('Room photo uploaded successfully');
              } catch (error) {
                console.error('Error uploading room photo:', error);
                toast.error('Failed to upload room photo');
              } finally {
                setUploadingRoom(false);
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled={uploadingRoom}
          >
            <ApperIcon name="Upload" size={14} className="mr-2" />
            {uploadingRoom ? 'Uploading...' : 'Upload Room Photo'}
          </Button>
        </label>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={!currentRoomPhoto}
          onClick={() => {
            // Switch to gallery mode to select images
            window.location.hash = '#select-images';
          }}
        >
          <ApperIcon name="Images" size={14} className="mr-2" />
          Select Images to Use
        </Button>
      </div>

      {roomPhotos.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-primary mb-2">Room Photos</h5>
          <div className="space-y-2">
{roomPhotos.map((photo) => (
              <button
                key={photo.Id}
                onClick={() => onRoomPhotoSelect?.(photo)}
                className={cn(
                  "w-full p-2 text-left rounded border text-sm",
                  currentRoomPhoto?.Id === photo.Id
                    ? "border-accent bg-accent/10"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {photo.Name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplatesSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Templates</h4>
      
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={!currentRoomPhoto || imagePlacements.length === 0}
          onClick={async () => {
            if (!currentRoomPhoto || !gallery) return;
            
            setSavingTemplate(true);
            try {
              const templateName = prompt('Template name:') || `Template ${Date.now()}`;
              
              // Create wall design
              const wallDesignService = await import('@/services/api/wallDesignService');
              const designData = {
                Name: templateName,
                roomphoto_id_c: currentRoomPhoto.Id,
                design_configuration_c: JSON.stringify({
                  roomPhoto: currentRoomPhoto,
                  placements: imagePlacements,
                  calibration: roomCalibration
                })
              };
              
              const newDesign = await wallDesignService.default.create(designData);
              
              // Save image placements
              const imagePlacementService = await import('@/services/api/imagePlacementService');
              for (const placement of imagePlacements) {
                await imagePlacementService.default.create({
                  ...placement,
                  walldesign_id_c: newDesign.Id
                });
              }
              
              onWallDesignsChange(prev => [...prev, newDesign]);
              toast.success('Template saved successfully');
            } catch (error) {
              console.error('Error saving template:', error);
              toast.error('Failed to save template');
            } finally {
              setSavingTemplate(false);
            }
          }}
        >
          <ApperIcon name="Save" size={14} className="mr-2" />
          {savingTemplate ? 'Saving...' : 'Save as Template'}
        </Button>
      </div>

      {wallDesigns.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-primary mb-2">Saved Templates</h5>
          <div className="space-y-2">
            {wallDesigns.map((design) => (
<button
                key={design.Id}
                onClick={async () => {
                  try {
                    if (onWallDesignSelect) {
                      onWallDesignSelect(design);
                    }
                    
                    // Load image placements for this design
                    if (onLoadImagePlacements) {
                      await onLoadImagePlacements(design.Id);
                    }
                    
                    toast.success('Template loaded');
                  } catch (error) {
                    console.error('Error loading template:', error);
                    toast.error('Failed to load template');
                  }
                }}
                className={cn(
                  "w-full p-2 text-left rounded border text-sm",
                  currentWallDesign?.Id === design.Id
                    ? "border-accent bg-accent/10"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {design.Name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCalibrationSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Room Calibration</h4>
      <p className="text-sm text-gray-600">
        Place an A4 sheet of paper in the room photo to calibrate the scale.
      </p>
      
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={!currentRoomPhoto || calibratingRoom}
          onClick={async () => {
            if (!currentRoomPhoto) return;
            
            setCalibratingRoom(true);
            try {
              // In a real implementation, this would use computer vision
              // to detect the A4 paper and calculate the scale
              const scale = prompt('Enter pixels per cm (measure A4 width):');
              if (!scale) return;
              
              const roomCalibrationService = await import('@/services/api/roomCalibrationService');
              const calibrationData = {
                Name: `Calibration for ${currentRoomPhoto.Name}`,
                roomphoto_id_c: currentRoomPhoto.Id,
                calibration_scale_c: parseFloat(scale),
                rotation_c: 0,
                translation_c: 50
              };
              
              const newCalibration = await roomCalibrationService.default.create(calibrationData);
              onRoomCalibrationChange(newCalibration);
              
              toast.success('Room calibrated successfully');
            } catch (error) {
              console.error('Error calibrating room:', error);
              toast.error('Failed to calibrate room');
            } finally {
              setCalibratingRoom(false);
            }
          }}
        >
          <ApperIcon name="Ruler" size={14} className="mr-2" />
          {calibratingRoom ? 'Calibrating...' : 'Calibrate with A4'}
        </Button>

        {roomCalibration && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <ApperIcon name="CheckCircle" size={16} />
              <span className="text-sm font-medium">Room Calibrated</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Scale: {roomCalibration.calibration_scale_c?.toFixed(2)} pixels/cm
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrderSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-primary">Add to Order</h4>
      
      {imagePlacements.length > 0 ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            {imagePlacements.length} artwork(s) in current design
          </div>
          
          <div className="space-y-2">
            {imagePlacements.map((placement, index) => {
              const widthCm = roomCalibration 
                ? (placement.width_c / roomCalibration.calibration_scale_c).toFixed(1)
                : 'N/A';
              const heightCm = roomCalibration
                ? (placement.height_c / roomCalibration.calibration_scale_c).toFixed(1)
                : 'N/A';
              
              return (
                <div key={placement.tempId || placement.Id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Image {index + 1}</div>
                  <div className="text-gray-600">Size: {widthCm} × {heightCm} cm</div>
                </div>
              );
            })}
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              // Add entire collection to cart
              const cartItems = imagePlacements.map((placement, index) => ({
                id: Date.now() + index,
                type: 'wall-art',
                imageId: placement.image_id_c,
                name: `Wall Art ${index + 1}`,
                width: roomCalibration ? (placement.width_c / roomCalibration.calibration_scale_c) : 20,
                height: roomCalibration ? (placement.height_c / roomCalibration.calibration_scale_c) : 15,
                quantity: 1,
                unitPrice: 50, // Base price
                placement: placement
              }));

              // Navigate to cart with items
              window.location.href = '/cart';
              localStorage.setItem('photographyCart', JSON.stringify(cartItems));
              
              toast.success(`Added ${cartItems.length} items to cart`);
            }}
          >
            <ApperIcon name="ShoppingCart" size={14} className="mr-2" />
            Add Collection to Order
          </Button>
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-4">
          No artwork placed yet. Drag images from the sidebar to start designing.
        </div>
      )}
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
              {/* Wall Designer sections */}
              {activeSection === 'wall-tools' && renderWallToolsSection()}
              {activeSection === 'templates' && renderTemplatesSection()}
              {activeSection === 'calibration' && renderCalibrationSection()}
              {activeSection === 'order' && renderOrderSection()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RightTools;