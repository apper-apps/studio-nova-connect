import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/cn';

const ImageUploadZone = ({ 
  onImagesUploaded, 
  galleryId,
  maxFiles = 50,
  acceptedTypes = 'image/*',
  className 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = async (files) => {
    const fileList = Array.from(files);
    
    if (fileList.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const validFiles = fileList.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const progressArray = new Array(validFiles.length).fill(0);
    setUploadProgress(progressArray);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = Math.min(newProgress[index] + 10, 90);
            return newProgress;
          });
        }, 200);

        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', file);
          
          // Simulate API call - replace with actual upload logic
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          clearInterval(progressInterval);
          
          // Complete progress
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = 100;
            return newProgress;
          });

          // Return uploaded image data
          return {
            Name: file.name,
            original_url_c: URL.createObjectURL(file), // Temporary URL - replace with actual upload URL
            thumbnail_url_c: URL.createObjectURL(file),
            proofing_url_c: URL.createObjectURL(file),
            gallery_id_c: galleryId,
            rating_c: 'unrated',
            order_c: Date.now() + index // Simple ordering
          };
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Notify parent component
      if (onImagesUploaded) {
        onImagesUploaded(uploadedImages);
      }
      
      toast.success(`Successfully uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}`);
      
    } catch (error) {
      toast.error('Failed to upload some images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          dragActive 
            ? "border-accent bg-accent/5 scale-105" 
            : "border-gray-300 hover:border-accent/50",
          uploading && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: uploading ? 1 : 1.02 }}
        whileTap={{ scale: uploading ? 1 : 0.98 }}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {uploading ? (
            <div className="space-y-4">
              <ApperIcon name="Upload" size={48} className="mx-auto text-accent animate-pulse" />
              <div>
                <p className="text-lg font-medium text-primary">Uploading images...</p>
                <div className="mt-4 space-y-2">
                  {uploadProgress.map((progress, index) => (
                    <div key={index} className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <ApperIcon name="Upload" size={48} className="mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-primary">
                  {dragActive ? "Drop images here" : "Drag and drop images here"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Or click to browse your computer
                </p>
              </div>
              <div className="text-xs text-gray-400">
                Supports: JPEG, PNG, GIF, WebP • Max {maxFiles} files
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Upload Button Alternative */}
      {!uploading && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;