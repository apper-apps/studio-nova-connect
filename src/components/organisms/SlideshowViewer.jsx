import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import RatingControls from "@/components/molecules/RatingControls";
import { cn } from "@/utils/cn";

const SlideshowViewer = ({ 
  images, 
  isOpen, 
  onClose, 
  onRatingChange,
  autoPlay = false 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(true);

  const currentImage = images[currentIndex];

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyPress = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case "ArrowRight":
      case " ":
        e.preventDefault();
        nextImage();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevImage();
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "p":
      case "P":
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
    }
  }, [isOpen, nextImage, prevImage, onClose, isPlaying]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyPress]);

  useEffect(() => {
    let interval;
    if (isPlaying && isOpen && images.length > 1) {
      interval = setInterval(nextImage, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, images.length, nextImage]);

  useEffect(() => {
    let timeout;
    if (isOpen) {
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, currentIndex]);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(window.controlsTimeout);
    window.controlsTimeout = setTimeout(() => setShowControls(false), 3000);
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImage.id}
          src={currentImage.proofingUrl}
          alt={`Image ${currentImage.id}`}
          className="max-w-full max-h-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6 pointer-events-auto">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">
                    {currentIndex + 1} of {images.length}
                  </h3>
                  <RatingControls
                    rating={currentImage.rating}
                    onRatingChange={(rating) => onRatingChange(currentImage.id, rating)}
                    size="default"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <ApperIcon name="X" size={24} />
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm pointer-events-auto"
            >
              <ApperIcon name="ChevronLeft" size={24} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm pointer-events-auto"
            >
              <ApperIcon name="ChevronRight" size={24} />
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6 pointer-events-auto">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <ApperIcon name={isPlaying ? "Pause" : "Play"} size={20} />
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                
                <div className="text-white text-sm">
                  Press Space or → for next image
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideshowViewer;