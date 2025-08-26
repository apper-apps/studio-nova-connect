import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const OrderSidebar = ({ 
  isOpen, 
  onToggle, 
  products = [], 
  orderItems = [],
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  salesTaxRate = 8.5,
  onSalesTaxChange,
  className 
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const selectedSizeData = selectedProductData?.sizes.find(s => s.size === selectedSize);

  const totals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const tax = subtotal * (salesTaxRate / 100);
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }, [orderItems, salesTaxRate]);

  const handleAddItem = () => {
    if (!selectedProduct || !selectedSize || quantity < 1) return;

    const product = products.find(p => p.id === selectedProduct);
    const size = product.sizes.find(s => s.size === selectedSize);

    onAddItem({
      productId: selectedProduct,
      productName: product.name,
      size: selectedSize,
      quantity: quantity,
      unitPrice: size.price
    });

    // Reset form
    setSelectedProduct("");
    setSelectedSize("");
    setQuantity(1);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed right-6 top-20 z-40 lg:hidden"
        size="sm"
      >
        <ApperIcon name="ShoppingCart" size={16} />
      </Button>

      {/* Desktop Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-30 overflow-y-auto",
              "lg:relative lg:shadow-none lg:border-l-0 lg:w-80",
              className
            )}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Order Form</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden"
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              {/* Add Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Product</Label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => {
                        setSelectedProduct(e.target.value);
                        setSelectedSize("");
                      }}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProductData && (
                    <div>
                      <Label>Size</Label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                      >
                        <option value="">Select Size</option>
                        {selectedProductData.sizes.map(size => (
                          <option key={size.size} value={size.size}>
                            {size.size} - ${size.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <Button
                    onClick={handleAddItem}
                    disabled={!selectedProduct || !selectedSize}
                    className="w-full"
                  >
                    Add to Order
                  </Button>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No items added yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.size} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(index)}
                              className="w-6 h-6 p-0 text-error hover:text-error"
                            >
                              <ApperIcon name="X" size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Sales Tax (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={salesTaxRate}
                      onChange={(e) => onSalesTaxChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({salesTaxRate}%):</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    disabled={orderItems.length === 0}
                  >
                    Complete Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default OrderSidebar;