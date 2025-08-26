import React, { useState } from "react";
import { Modal, ModalHeader, ModalTitle, ModalContent } from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import RatingControls from "@/components/molecules/RatingControls";
import { cn } from "@/utils/cn";

const ComparisonModal = ({ 
  isOpen, 
  onClose, 
  images, 
  onRatingChange 
}) => {
  const [blackWhiteStates, setBlackWhiteStates] = useState({});

  const toggleBlackWhite = (imageId) => {
    setBlackWhiteStates(prev => ({
      ...prev,
      [imageId]: !prev[imageId]
    }));
  };

  if (!images || images.length === 0) return null;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-2 lg:grid-cols-3"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalHeader>
        <ModalTitle>
          Compare Images ({images.length})
        </ModalTitle>
      </ModalHeader>
      
      <ModalContent className="px-0 py-0">
        <div className={cn(
          "grid gap-4 p-6",
          gridCols[images.length] || "grid-cols-2 lg:grid-cols-3"
        )}>
          {images.map((image) => (
            <div key={image.id} className="space-y-3">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={image.proofingUrl}
                  alt={`Image ${image.id}`}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-200",
                    blackWhiteStates[image.id] && "grayscale"
                  )}
                />
                
                {/* B&W Toggle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBlackWhite(image.id)}
                    className={cn(
                      "w-8 h-8 p-0 rounded-full",
                      blackWhiteStates[image.id] 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "bg-white/80 text-primary hover:bg-white"
                    )}
                    title="Toggle Black & White"
                  >
                    <ApperIcon name="Palette" size={14} />
                  </Button>
                </div>
              </div>
              
              {/* Rating Controls */}
              <div className="flex items-center justify-center">
                <RatingControls
                  rating={image.rating}
                  onRatingChange={(rating) => onRatingChange(image.id, rating)}
                  size="default"
                />
              </div>
            </div>
          ))}
        </div>
      </ModalContent>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close Comparison
        </Button>
      </div>
    </Modal>
  );
};

export default ComparisonModal;