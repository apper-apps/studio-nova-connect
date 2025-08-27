import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ImageThumbnail = ({ 
  image, 
  isSelected, 
isBlackWhite,
  onSelect,
  onToggleBlackWhite,
  showRating = true,
  className 
}) => {
  const getRatingIcon = (rating) => {
    switch (rating) {
      case "yes": return { icon: "Smile", color: "bg-success" };
      case "maybe": return { icon: "Meh", color: "bg-warning" };
      case "no": return { icon: "Frown", color: "bg-error" };
      default: return null;
    }
};

  const ratingInfo = getRatingIcon(image.rating_c || image.rating);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 group",
        isSelected ? "border-accent shadow-lg" : "border-transparent hover:border-gray-300",
        className
      )}
onClick={(e) => onSelect(image, e.shiftKey)}
    >
<img
        src={image.thumbnail_url_c || image.thumbnailUrl}
        alt={`Image ${image.Id || image.id}`}
        className={cn(
          "w-full h-full object-cover transition-all duration-200",
          (isBlackWhite || image.effect_type_c === 'Black and White') && "grayscale",
          "group-hover:brightness-110"
        )}
        loading="lazy"
      />
      
      {/* Rating Badge */}
      {showRating && ratingInfo && (
        <div className={cn(
          "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
          ratingInfo.color
        )}>
          <ApperIcon 
            name={ratingInfo.icon} 
            size={14} 
            className="text-white" 
          />
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-accent/20 border-2 border-accent rounded-lg" />
      )}

      {/* B&W Toggle */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBlackWhite();
          }}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200",
            isBlackWhite ? "bg-primary text-white" : "bg-white/80 text-primary hover:bg-white"
          )}
          title="Toggle Black & White"
        >
          <ApperIcon name="Palette" size={12} />
        </button>
      </div>
    </motion.div>
  );
};

export default ImageThumbnail;