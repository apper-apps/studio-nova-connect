import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import GalleryGrid from "@/components/organisms/GalleryGrid";
import SlideshowViewer from "@/components/organisms/SlideshowViewer";
import ComparisonModal from "@/components/organisms/ComparisonModal";
import OrderSidebar from "@/components/organisms/OrderSidebar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { format } from "date-fns";
import galleryService from "@/services/api/galleryService";
import clientService from "@/services/api/clientService";
import productService from "@/services/api/productService";

const CurrentSession = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const galleryId = searchParams.get("galleryId");

  const [gallery, setGallery] = useState(null);
  const [client, setClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [blackWhiteImages, setBlackWhiteImages] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showOrderSidebar, setShowOrderSidebar] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [salesTaxRate, setSalesTaxRate] = useState(8.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (galleryId) {
      loadSessionData();
    } else {
      setError("No gallery selected for session");
      setLoading(false);
    }
  }, [galleryId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [galleryData, productsData] = await Promise.all([
        galleryService.getById(parseInt(galleryId)),
        productService.getAll()
      ]);
      
      setGallery(galleryData);
      setProducts(productsData);
      
if (galleryData.client_id_c) {
        const clientData = await clientService.getById(galleryData.client_id_c);
        setClient(clientData);
      }
    } catch (err) {
      setError("Failed to load session data. Please try again.");
      console.error("Error loading session:", err);
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

const handleImageToggleBlackWhite = async (imageId) => {
try {
      const image = gallery.images.find(img => img.Id === imageId);
      const currentEffect = image?.effect_type_c;
      const newEffect = currentEffect === 'Black and White' ? null : 'Black and White';
      
      const { default: imageService } = await import('@/services/api/imageService');
      await imageService.update(imageId, {
        effect_type_c: newEffect
      });
      
      // Update local state for immediate visual feedback
      setBlackWhiteImages(prev => {
        if (prev.includes(imageId)) {
          return prev.filter(id => id !== imageId);
        } else {
          return [...prev, imageId];
        }
      });
      
      // Refresh session data to get updated effects
      await loadSessionData();
      
    } catch (error) {
      console.error('Error updating image effect:', error);
      toast.error('Failed to update image effect');
    }
  };

const handleRatingChange = async (imageId, rating) => {
    try {
      // Update the specific image record using imageService
      const imageService = await import('@/services/api/imageService');
      await imageService.default.updateRating(imageId, rating);
      
      // Update the local gallery state for immediate UI feedback
      const updatedGallery = { ...gallery };
      const imageIndex = updatedGallery.images.findIndex(img => (img.Id || img.id) === imageId);
      
      if (imageIndex !== -1) {
        updatedGallery.images[imageIndex].rating = rating;
        setGallery(updatedGallery);
      }
      
      toast.success("Image rating updated");
    } catch (err) {
      toast.error("Failed to update image rating");
      console.error("Error updating rating:", err?.response?.data?.message || err.message);
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

const handleAddOrderItem = (item) => {
    setOrderItems(prev => {
      // Check if the same product/size combo already exists
      const existingIndex = prev.findIndex(existing => 
        existing.productId === item.productId && 
        existing.size === item.size &&
        existing.lineItemType === item.lineItemType
      );

      if (existingIndex >= 0 && item.lineItemType === "Product") {
        // Update existing item quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
          specialRequests: item.specialRequests || updated[existingIndex].specialRequests
        };
        return updated;
      } else {
        // Add new item
        return [...prev, { ...item, id: Date.now() }];
      }
    });
  };

  const handleUpdateOrderItem = (index, updatedItem) => {
    setOrderItems(prev => prev.map((item, i) => i === index ? { ...item, ...updatedItem } : item));
  };

  const handleRemoveOrderItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadSessionData} />;
  }

  if (!gallery) {
    return <Error message="Gallery not found" />;
  }

  const filteredImages = activeFilter === "all" ? gallery.images : 
    gallery.images.filter(img => activeFilter === "unrated" ? 
      (!img.rating || img.rating === "unrated") : img.rating === activeFilter);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Session Header */}
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
            <h1 className="text-3xl font-bold text-primary">Sales Session</h1>
            <p className="text-gray-600 mt-1">
              {gallery.name} • {client ? `${client.firstName} ${client.lastName}` : "Unknown Client"}
            </p>
            <p className="text-sm text-gray-500">
              {format(new Date(gallery.sessionDate), "MMMM dd, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowOrderSidebar(!showOrderSidebar)}
              className="lg:hidden"
            >
              <ApperIcon name="ShoppingCart" size={16} className="mr-2" />
              Order ({orderItems.length})
            </Button>
            <Button onClick={handlePlaySlideshow}>
              <ApperIcon name="Play" size={16} className="mr-2" />
              Start Presentation
            </Button>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-accent to-accent/80 text-white p-4 rounded-lg">
            <p className="text-sm opacity-90">Total Images</p>
            <p className="text-2xl font-bold">{gallery.images?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-success to-success/80 text-white p-4 rounded-lg">
            <p className="text-sm opacity-90">Favorites</p>
            <p className="text-2xl font-bold">
              {gallery.images?.filter(img => img.rating === "yes").length || 0}
            </p>
          </div>
          <div className="bg-gradient-to-r from-warning to-warning/80 text-white p-4 rounded-lg">
            <p className="text-sm opacity-90">Selected</p>
            <p className="text-2xl font-bold">{selectedImages.length}</p>
          </div>
          <div className="bg-gradient-to-r from-info to-info/80 text-white p-4 rounded-lg">
            <p className="text-sm opacity-90">Order Items</p>
            <p className="text-2xl font-bold">{orderItems.length}</p>
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
        />
      </div>

      {/* Order Sidebar */}
      <OrderSidebar
        isOpen={showOrderSidebar}
        onToggle={() => setShowOrderSidebar(!showOrderSidebar)}
        products={products}
        orderItems={orderItems}
        onAddItem={handleAddOrderItem}
        onUpdateItem={handleUpdateOrderItem}
        onRemoveItem={handleRemoveOrderItem}
        salesTaxRate={salesTaxRate}
        onSalesTaxChange={setSalesTaxRate}
      />

      {/* Slideshow Viewer */}
      <SlideshowViewer
        images={filteredImages}
        isOpen={showSlideshow}
        onClose={() => setShowSlideshow(false)}
        onRatingChange={handleRatingChange}
        autoPlay={true}
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

export default CurrentSession;