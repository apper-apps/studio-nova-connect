import React from 'react'
import BulkActionsToolbar from '@/components/molecules/BulkActionsToolbar'
import { motion } from "framer-motion";
import ImageThumbnail from "@/components/molecules/ImageThumbnail";
import FilterTabs from "@/components/molecules/FilterTabs";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import { cn } from "@/utils/cn";

const GalleryGrid = ({
  images,
selectedImages = [],
  blackWhiteImages = [],
  activeFilter = "all",
  loading = false,
  onImageSelect,
  onImageToggleBlackWhite,
  onFilterChange,
  onCompareImages,
  onPlaySlideshow,
  onBulkRating,
  onClearSelection,
  className
}) => {
  const filteredImages = React.useMemo(() => {
    if (activeFilter === "all") return images;
    if (activeFilter === "unrated") return images.filter(img => !img.rating || img.rating === "unrated");
    return images.filter(img => img.rating === activeFilter);
  }, [images, activeFilter]);

  const counts = React.useMemo(() => {
    return {
      all: images.length,
      yes: images.filter(img => img.rating === "yes").length,
      maybe: images.filter(img => img.rating === "maybe").length,
      no: images.filter(img => img.rating === "no").length,
      unrated: images.filter(img => !img.rating || img.rating === "unrated").length
    };
  }, [images]);

  const handleImageSelect = (image, isShiftClick = false) => {
    onImageSelect(image, isShiftClick);
  };

  if (loading) {
    return <Loading type="gallery" className={className} />;
  }

  if (images.length === 0) {
    return (
      <div className={className}>
        <Empty
          icon="Images"
          title="No images found"
          description="Upload some images to get started with your gallery."
          actionLabel="Upload Images"
          onAction={() => console.log("Upload images")}
        />
      </div>
    );
  }

  return (
<div className={cn("space-y-6", className)}>
      {/* Bulk Actions Toolbar */}
      {selectedImages.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedImages.length}
          onBulkRating={onBulkRating}
          onClearSelection={onClearSelection}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          counts={counts}
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPlaySlideshow}
            disabled={filteredImages.length === 0}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Play" size={16} />
            Slideshow
          </Button>
          
          <Button
            variant="outline"
            onClick={onCompareImages}
            disabled={selectedImages.length < 2 || selectedImages.length > 6}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Eye" size={16} />
            Compare ({selectedImages.length})
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <Empty
          icon="Filter"
          title="No images match this filter"
          description="Try selecting a different filter to see more images."
        />
      ) : (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
{filteredImages.map((image, index) => (
            <motion.div
              key={image.Id || `image-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ImageThumbnail
                image={image}
                isSelected={selectedImages.some(selected => selected.id === image.id)}
                isBlackWhite={blackWhiteImages.includes(image.id)}
                onSelect={(img) => handleImageSelect(img, false)}
                onToggleBlackWhite={() => onImageToggleBlackWhite(image.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default GalleryGrid;