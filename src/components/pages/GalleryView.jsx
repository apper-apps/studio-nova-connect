import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import GalleryGrid from "@/components/organisms/GalleryGrid";
import SlideshowViewer from "@/components/organisms/SlideshowViewer";
import ComparisonModal from "@/components/organisms/ComparisonModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import galleryService from "@/services/api/galleryService";
import clientService from "@/services/api/clientService";

const GalleryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [client, setClient] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [blackWhiteImages, setBlackWhiteImages] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadGallery();
    }
  }, [id]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError("");
      
      const galleryData = await galleryService.getById(parseInt(id));
      setGallery(galleryData);
      
      if (galleryData.clientId) {
        const clientData = await clientService.getById(galleryData.clientId);
        setClient(clientData);
      }
    } catch (err) {
      setError("Failed to load gallery. Please try again.");
      console.error("Error loading gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image, isShiftClick = false) => {
    if (isShiftClick) {
      setSelectedImages(prev => {
        const exists = prev.find(img => img.id === image.id);
        if (exists) {
          return prev.filter(img => img.id !== image.id);
        } else if (prev.length < 6) {
          return [...prev, image];
        }
        return prev;
      });
    } else {
      setSelectedImages(prev => {
        const exists = prev.find(img => img.id === image.id);
        return exists ? [] : [image];
      });
    }
  };

  const handleImageToggleBlackWhite = (imageId) => {
    setBlackWhiteImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
  };

  const handleRatingChange = async (imageId, rating) => {
    try {
      const updatedGallery = { ...gallery };
      const imageIndex = updatedGallery.images.findIndex(img => img.id === imageId);
      
      if (imageIndex !== -1) {
        updatedGallery.images[imageIndex].rating = rating;
        await galleryService.update(gallery.id, updatedGallery);
        setGallery(updatedGallery);
        toast.success("Image rating updated");
      }
    } catch (err) {
      toast.error("Failed to update image rating");
      console.error("Error updating rating:", err);
    }
  };

  const handlePlaySlideshow = () => {
    const filteredImages = activeFilter === "all" ? gallery.images : 
      gallery.images.filter(img => activeFilter === "unrated" ? 
        (!img.rating || img.rating === "unrated") : img.rating === activeFilter);
    
    if (filteredImages.length > 0) {
      setShowSlideshow(true);
    }
  };

  const handleCompareImages = () => {
    if (selectedImages.length >= 2 && selectedImages.length <= 6) {
      setShowComparison(true);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadGallery} />;
  }

  if (!gallery) {
    return <Error message="Gallery not found" />;
  }

  const filteredImages = activeFilter === "all" ? gallery.images : 
    gallery.images.filter(img => activeFilter === "unrated" ? 
      (!img.rating || img.rating === "unrated") : img.rating === activeFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">{gallery.name}</h1>
          <p className="text-gray-600 mt-1">
            {client ? `${client.firstName} ${client.lastName}` : "Unknown Client"} • {gallery.images?.length || 0} images
          </p>
        </div>
        <Button
          onClick={() => navigate(`/session?galleryId=${gallery.id}`)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Play" size={16} />
          Start Session
        </Button>
      </div>

      {/* Gallery Grid */}
      <GalleryGrid
        images={gallery.images || []}
        selectedImages={selectedImages}
        blackWhiteImages={blackWhiteImages}
        activeFilter={activeFilter}
        onImageSelect={handleImageSelect}
        onImageToggleBlackWhite={handleImageToggleBlackWhite}
        onFilterChange={setActiveFilter}
        onCompareImages={handleCompareImages}
        onPlaySlideshow={handlePlaySlideshow}
      />

      {/* Slideshow Viewer */}
      <SlideshowViewer
        images={filteredImages}
        isOpen={showSlideshow}
        onClose={() => setShowSlideshow(false)}
        onRatingChange={handleRatingChange}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        images={selectedImages}
        onRatingChange={handleRatingChange}
      />
    </div>
  );
};

export default GalleryView;