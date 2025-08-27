import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Settings from "@/components/pages/Settings";
import ComparisonModal from "@/components/organisms/ComparisonModal";
import SlideshowViewer from "@/components/organisms/SlideshowViewer";
import GalleryGrid from "@/components/organisms/GalleryGrid";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/atoms/Modal";
import clientService from "@/services/api/clientService";
import galleryService from "@/services/api/galleryService";
import imageService from "@/services/api/imageService";
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
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [gallerySettings, setGallerySettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    password: "",
    expiryDate: "",
    enableDownloads: false
});

  useEffect(() => {
    if (id) {
      loadGallery();
      loadGallerySettings();
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

  const loadGallerySettings = async () => {
    try {
      const { default: gallerySettingService } = await import("@/services/api/gallerySettingService");
      const settings = await gallerySettingService.getByGalleryId(parseInt(id));
      setGallerySettings(settings);
      
      if (settings) {
        setSettingsForm({
          password: settings.password || "",
          expiryDate: settings.expiryDate || "",
          enableDownloads: settings.enableDownloads || false
        });
      }
    } catch (err) {
      console.error("Error loading gallery settings:", err);
    }
  };

  const handlePublishToWeb = async () => {
    if (!gallery) return;
    
    try {
      setPublishing(true);
      
      // Generate unique shareable URL
      const shareableUrl = `gallery-${gallery.Id}-${Date.now().toString(36)}`;
      
      // Update gallery with shareable URL
      const updatedGallery = await galleryService.update(gallery.Id, {
        ...gallery,
        shareableUrl
      });
      
      setGallery(updatedGallery);
      toast.success("Gallery published! Shareable link created.");
    } catch (err) {
      toast.error("Failed to publish gallery");
      console.error("Error publishing gallery:", err);
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    try {
      const { default: gallerySettingService } = await import("@/services/api/gallerySettingService");
      
      const settingData = {
        ...settingsForm,
        galleryId: parseInt(id)
      };

      if (gallerySettings) {
        await gallerySettingService.update(gallerySettings.Id, settingData);
      } else {
        await gallerySettingService.create(settingData);
      }
      
      await loadGallerySettings();
      setShowSettings(false);
      toast.success("Gallery settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save gallery settings");
      console.error("Error saving gallery settings:", err);
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

  const handleBulkRating = async (rating) => {
    if (selectedImages.length === 0) return;
    
    try {
      setLoading(true);
      
      // Extract image IDs from selected images
      const imageIds = selectedImages.map(img => img.id);
      
      // Use the imageService for bulk rating update
      await imageService.bulkUpdateRating(imageIds, rating);
      
      // Update local gallery state
      const updatedGallery = { ...gallery };
      updatedGallery.images = updatedGallery.images.map(img => {
        if (imageIds.includes(img.id)) {
          return { ...img, rating };
        }
        return img;
      });
      
      setGallery(updatedGallery);
      setSelectedImages([]);
      
      toast.success(`Successfully rated ${selectedImages.length} image${selectedImages.length === 1 ? '' : 's'} as "${rating}"`);
    } catch (err) {
      toast.error("Failed to update bulk ratings");
      console.error("Error updating bulk ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedImages([]);
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
          {gallery.shareableUrl && (
            <p className="text-sm text-success mt-1 flex items-center gap-2">
              <ApperIcon name="Globe" size={14} />
              Published to web
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Settings" size={16} />
            Gallery Settings
          </Button>
          
          {gallery.shareableUrl ? (
            <Button
              variant="outline"
              onClick={() => {
                const url = `${window.location.origin}/gallery/share/${gallery.shareableUrl}`;
                navigator.clipboard.writeText(url);
                toast.success("Shareable link copied to clipboard!");
              }}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Link" size={16} />
              Copy Link
            </Button>
          ) : (
            <Button
              onClick={handlePublishToWeb}
              disabled={publishing}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Globe" size={16} />
              {publishing ? "Publishing..." : "Publish to Web"}
            </Button>
          )}
          
          <Button
            onClick={() => navigate(`/session?galleryId=${gallery.id}`)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Play" size={16} />
            Start Session
          </Button>
        </div>
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
        onBulkRating={handleBulkRating}
        onClearSelection={handleClearSelection}
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

      {/* Gallery Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} size="lg">
        <form onSubmit={handleSaveSettings}>
          <ModalHeader>
            <ModalTitle>Gallery Settings</ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4">
            <FormField
              label="Password Protection"
              type="password"
              value={settingsForm.password}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Leave empty for no password protection"
            />
            
            <FormField
              label="Expiry Date"
              type="date"
              value={settingsForm.expiryDate}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, expiryDate: e.target.value }))}
              placeholder="Leave empty for no expiry"
            />
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableDownloads"
                checked={settingsForm.enableDownloads}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, enableDownloads: e.target.checked }))}
                className="w-4 h-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label htmlFor="enableDownloads" className="text-sm font-medium text-primary">
                Enable client downloads
              </label>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Settings
            </Button>
          </ModalFooter>
        </form>
</Modal>
    </div>
  );
};

export default GalleryView;