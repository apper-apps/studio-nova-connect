import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LeftTray from './LeftTray';
import CenterWorkspace from './CenterWorkspace';
import RightTools from './RightTools';
import FooterBar from './FooterBar';
import galleryService from '@/services/api/galleryService';
import imageService from '@/services/api/imageService';
import { toast } from 'react-toastify';
import Loading from '@/components/ui/Loading';

const IPSLayout = ({ mode = 'gallery' }) => {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [leftTrayCollapsed, setLeftTrayCollapsed] = useState(false);
  const [rightToolsCollapsed, setRightToolsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadGalleryData();
  }, [id]);

  const loadGalleryData = async () => {
    try {
      setLoading(true);
      const galleryData = await galleryService.getById(id);
      setGallery(galleryData);
      setImages(galleryData.images || []);
    } catch (error) {
      toast.error('Failed to load gallery');
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image, isShiftClick = false) => {
    if (isShiftClick && selectedImages.length > 0) {
      // Range selection logic
      const lastSelectedIndex = images.findIndex(img => img.id === selectedImages[selectedImages.length - 1].id);
      const currentIndex = images.findIndex(img => img.id === image.id);
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeImages = images.slice(start, end + 1);
      setSelectedImages(prev => {
        const newSelected = [...prev];
        rangeImages.forEach(img => {
          if (!newSelected.some(selected => selected.id === img.id)) {
            newSelected.push(img);
          }
        });
        return newSelected;
      });
    } else {
      // Single selection toggle
      setSelectedImages(prev => {
        const isSelected = prev.some(selected => selected.id === image.id);
        if (isSelected) {
          return prev.filter(selected => selected.id !== image.id);
        } else {
          return [...prev, image];
        }
      });
    }
  };

  const handleImageRating = async (imageId, rating) => {
    try {
      await imageService.updateRating(imageId, rating);
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, rating } : img
      ));
      toast.success('Image rating updated');
    } catch (error) {
      toast.error('Failed to update rating');
    }
  };

  const getCurrentImage = () => {
    return images[currentImageIndex] || null;
  };

  const filteredImages = images.filter(image => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unrated') return !image.rating || image.rating === 'unrated';
    return image.rating === activeFilter;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full bg-white">
      {/* Left Tray */}
      <LeftTray
        gallery={gallery}
        images={filteredImages}
        currentImageIndex={currentImageIndex}
        onImageSelect={setCurrentImageIndex}
        collapsed={leftTrayCollapsed}
        onToggleCollapse={() => setLeftTrayCollapsed(!leftTrayCollapsed)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Center Workspace */}
      <CenterWorkspace
        mode={mode}
        currentImage={getCurrentImage()}
        selectedImages={selectedImages}
        images={filteredImages}
        currentImageIndex={currentImageIndex}
        onImageChange={setCurrentImageIndex}
        onImageSelect={handleImageSelect}
      />

      {/* Right Tools */}
      <RightTools
        mode={mode}
        currentImage={getCurrentImage()}
        selectedImages={selectedImages}
        onImageRating={handleImageRating}
        onClearSelection={() => setSelectedImages([])}
        collapsed={rightToolsCollapsed}
        onToggleCollapse={() => setRightToolsCollapsed(!rightToolsCollapsed)}
      />

      {/* Footer Bar */}
      <FooterBar
        mode={mode}
        currentImage={getCurrentImage()}
        selectedImages={selectedImages}
        totalImages={filteredImages.length}
        currentIndex={currentImageIndex}
      />
    </div>
  );
};

export default IPSLayout;