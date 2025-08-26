import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/atoms/Modal";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import productService from "@/services/api/productService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    sizes: [{ size: "", price: 0 }]
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.category || productForm.sizes.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validSizes = productForm.sizes.filter(size => size.size && size.price > 0);
    if (validSizes.length === 0) {
      toast.error("Please add at least one size with a valid price");
      return;
    }

    try {
      const productData = {
        ...productForm,
        sizes: validSizes
      };

      if (editingProduct) {
        const updatedProduct = await productService.update(editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        toast.success("Product updated successfully!");
      } else {
        const newProduct = await productService.create(productData);
        setProducts(prev => [newProduct, ...prev]);
        toast.success("Product created successfully!");
      }

      resetForm();
    } catch (err) {
      toast.error(editingProduct ? "Failed to update product" : "Failed to create product");
      console.error("Error saving product:", err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      sizes: [...product.sizes]
    });
    setShowCreateModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productService.delete(product.id);
        setProducts(prev => prev.filter(p => p.id !== product.id));
        toast.success("Product deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete product");
        console.error("Error deleting product:", err);
      }
    }
  };

  const resetForm = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "",
      sizes: [{ size: "", price: 0 }]
    });
  };

  const addSize = () => {
    setProductForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: 0 }]
    }));
  };

  const removeSize = (index) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const updateSize = (index, field, value) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: field === "price" ? parseFloat(value) || 0 : value } : size
      )
    }));
  };

  if (loading) {
    return <Loading type="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProducts} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Products</h1>
          <p className="text-gray-600 mt-1">Manage your photography products and pricing</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products..."
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Empty
          icon="Package"
          title={searchQuery ? "No products found" : "No products yet"}
          description={searchQuery ? "Try adjusting your search terms." : "Create your first product to start building your price list."}
          actionLabel={!searchQuery ? "Add Product" : undefined}
          onAction={!searchQuery ? () => setShowCreateModal(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="w-8 h-8 p-0"
                      >
                        <ApperIcon name="Edit" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="w-8 h-8 p-0 text-error hover:text-error"
                      >
                        <ApperIcon name="Trash" size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Tag" size={14} className="mr-2" />
                      {product.category}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary">Sizes & Pricing</h4>
                      <div className="space-y-1">
                        {product.sizes.map((size, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{size.size}</span>
                            <span className="font-medium">${size.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <span>{product.sizes.length} size{product.sizes.length !== 1 ? "s" : ""}</span>
                      <span>${Math.min(...product.sizes.map(s => s.price)).toFixed(2)} - ${Math.max(...product.sizes.map(s => s.price)).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Product Modal */}
      <Modal isOpen={showCreateModal} onClose={resetForm} size="lg">
        <form onSubmit={handleCreateProduct}>
          <ModalHeader>
            <ModalTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4">
            <FormField
              label="Product Name"
              required
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Digital Download, Print Package"
            />
            
            <FormField
              label="Category"
              required
              value={productForm.category}
              onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Prints, Digital, Albums"
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-primary">
                  Sizes & Pricing <span className="text-error">*</span>
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addSize}>
                  <ApperIcon name="Plus" size={14} className="mr-1" />
                  Add Size
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {productForm.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Size (e.g., 8x10, 11x14)"
                        value={size.size}
                        onChange={(e) => updateSize(index, "size", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={size.price || ""}
                        onChange={(e) => updateSize(index, "price", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSize(index)}
                      disabled={productForm.sizes.length === 1}
                      className="w-8 h-8 p-0 text-error hover:text-error"
                    >
                      <ApperIcon name="Trash" size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default Products;