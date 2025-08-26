import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/atoms/Modal";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import galleryService from "@/services/api/galleryService";
import gallerySettingService from "@/services/api/gallerySettingService";
import favoriteImageService from "@/services/api/favoriteImageService";
import downloadService from "@/services/api/downloadService";
import productService from "@/services/api/productService";

const PublicGallery = () => {
  const { url } = useParams();
  const navigate = useNavigate();
  
  const [gallery, setGallery] = useState(null);
  const [settings, setSettings] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  // Mock client ID for demo - in production this would come from session/login
  const [clientId] = useState(1);

  useEffect(() => {
    if (url) {
      loadGallery();
    }
  }, [url]);

  useEffect(() => {
    if (gallery && authenticated) {
      loadFavorites();
      loadProducts();
    }
  }, [gallery, authenticated]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError("");

      // Find gallery by shareable URL
      const galleries = await galleryService.getAll();
      const foundGallery = galleries.find(g => g.shareableUrl === url);

      if (!foundGallery) {
        setError("Gallery not found or no longer available.");
        return;
      }

      setGallery(foundGallery);

      // Load gallery settings
      const gallerySetting = await gallerySettingService.getByGalleryId(foundGallery.Id);
      setSettings(gallerySetting);

      // Check if password is required
      if (gallerySetting && gallerySetting.password && gallerySetting.password.trim() !== "") {
        setPasswordRequired(true);
      } else {
        // Check expiry
        const validation = gallerySettingService.validateAccess(gallerySetting, "");
        if (!validation.valid) {
          setError(validation.reason);
          return;
        }
        setAuthenticated(true);
      }
    } catch (err) {
      setError("Failed to load gallery. Please try again.");
      console.error("Error loading public gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const clientFavorites = await favoriteImageService.getByClientAndGallery(clientId, gallery.Id);
      setFavorites(clientFavorites);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const allProducts = await productService.getAll();
      setProducts(allProducts);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!settings) return;

    const validation = gallerySettingService.validateAccess(settings, password);
    if (!validation.valid) {
      toast.error(validation.reason);
      return;
    }

    setAuthenticated(true);
    setPasswordRequired(false);
    toast.success("Access granted!");
  };

  const handleToggleFavorite = async (imageId) => {
    try {
      const isFav = favorites.some(fav => fav.imageId === imageId);
      
      if (isFav) {
        await favoriteImageService.removeFavorite(clientId, imageId, gallery.Id);
        setFavorites(prev => prev.filter(fav => fav.imageId !== imageId));
        toast.success("Removed from favorites");
      } else {
        await favoriteImageService.addFavorite(clientId, imageId, gallery.Id);
        const newFav = { clientId, imageId, galleryId: gallery.Id };
        setFavorites(prev => [...prev, newFav]);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error("Failed to update favorite");
      console.error("Error updating favorite:", err);
    }
  };

  const handleDownload = async (image, resolution = "high") => {
    try {
      if (settings && !settings.enableDownloads) {
        toast.error("Downloads are not enabled for this gallery");
        return;
      }

      // Record download
      await downloadService.recordDownload(clientId, image.id, resolution);
      
      // In production, this would download the actual file
      toast.success(`Download started (${resolution} resolution)`);
    } catch (err) {
      toast.error("Failed to download image");
      console.error("Error downloading image:", err);
    }
  };

  const handleAddToCart = (productId, size, quantity = 1) => {
    const product = products.find(p => p.Id === productId);
    const sizeData = product.sizes.find(s => s.size === size);
    
    if (!product || !sizeData) return;

    const cartItem = {
      id: `${productId}-${size}`,
      productId,
      productName: product.Name,
      size,
      price: sizeData.price,
      quantity,
      selectedImages: [...selectedImages]
    };

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === cartItem.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, cartItem];
    });

    toast.success("Added to cart");
    setSelectedImages([]);
  };

  if (loading) {
    return <Loading type="gallery" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Error message={error} />
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Gallery Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <FormField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter gallery password"
                required
              />
              <Button type="submit" className="w-full">
                Access Gallery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gallery || !authenticated) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">{gallery.Name}</h1>
              <p className="text-gray-600 mt-1">{gallery.images?.length || 0} images</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-2"
              >
                <ApperIcon name="ShoppingCart" size={16} />
                Cart ({cartItems.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!gallery.images || gallery.images.length === 0 ? (
          <Empty
            icon="Images"
            title="No images available"
            description="This gallery doesn't have any images yet."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {gallery.images.map((image, index) => {
              const isFavorite = favorites.some(fav => fav.imageId === image.id);
              const isSelected = selectedImages.includes(image.id);

              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedImages(prev => prev.filter(id => id !== image.id));
                    } else {
                      setSelectedImages(prev => [...prev, image.id]);
                    }
                  }}
                >
                  <img
                    src={image.thumbnail_url || image.proofing_url || "/api/placeholder/300/300"}
                    alt={image.Name || "Gallery image"}
                    className="w-full h-full object-cover"
                  />

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent/20 border-2 border-accent" />
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(image.id);
                      }}
                      className="w-8 h-8 p-0"
                    >
                      <ApperIcon 
                        name="Heart" 
                        size={14} 
                        className={isFavorite ? "fill-red-500 text-red-500" : ""} 
                      />
                    </Button>
                    
                    {settings?.enableDownloads && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                        className="w-8 h-8 p-0"
                      >
                        <ApperIcon name="Download" size={14} />
                      </Button>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <ApperIcon name="Check" size={14} className="text-white" />
                    </div>
                  )}

                  {/* Favorite Indicator */}
                  {isFavorite && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <ApperIcon name="Heart" size={12} className="text-white fill-current" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Shopping Section */}
        {selectedImages.length > 0 && products.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-primary mb-4">
              Order Products with Selected Images ({selectedImages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.Id} className="p-4">
                  <h4 className="font-medium text-primary mb-2">{product.Name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                  <div className="space-y-2">
                    {product.sizes.map((size) => (
                      <div key={size.size} className="flex items-center justify-between">
                        <span className="text-sm">{size.size}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${size.price.toFixed(2)}</span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product.Id, size.size)}
                            className="text-xs px-2 py-1"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shopping Cart Modal */}
      <Modal isOpen={showCart} onClose={() => setShowCart(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Shopping Cart</ModalTitle>
        </ModalHeader>
        <ModalContent>
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="ShoppingCart" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size} × {item.quantity} | {item.selectedImages.length} images
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))}
                      className="text-error hover:text-error"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCart(false)}>
            Continue Shopping
          </Button>
          {cartItems.length > 0 && (
            <Button onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PublicGallery;