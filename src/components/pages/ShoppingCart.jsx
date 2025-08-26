import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US"
    }
  });

  useEffect(() => {
    // Load cart items from localStorage or session
    const savedCart = JSON.parse(localStorage.getItem('photographyCart') || '[]');
    setCartItems(savedCart);
    
    // Get cart items from navigation state if available
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      localStorage.setItem('photographyCart', JSON.stringify(location.state.cartItems));
    }
  }, [location.state]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('photographyCart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (itemId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      localStorage.setItem('photographyCart', JSON.stringify(updated));
      return updated;
    });
    toast.success("Item removed from cart");
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
      toast.error("Please fill in all required customer information");
      return;
    }

    try {
      setProcessing(true);
      
      // In production, this would integrate with Stripe
      // For demo purposes, we'll simulate the checkout process
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart
      setCartItems([]);
      localStorage.removeItem('photographyCart');
      
      toast.success("Order placed successfully! You will receive a confirmation email.");
      navigate('/order-confirmation', { 
        state: { 
          orderTotal: calculateTotals().total,
          orderItems: cartItems 
        }
      });
      
    } catch (err) {
      toast.error("Failed to process order. Please try again.");
      console.error("Checkout error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
              Back to Gallery
            </Button>
            <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center">
            <Empty
              icon="ShoppingCart"
              title="Your cart is empty"
              description="Add some products from the gallery to get started."
              actionLabel="Return to Gallery"
              onAction={() => navigate(-1)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-primary mb-4">Order Items</h2>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-primary">{item.productName}</h3>
                          <p className="text-sm text-gray-600">{item.size}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.selectedImages?.length || 0} selected images
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 p-0"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 p-0 text-error hover:text-error"
                          >
                            <ApperIcon name="Trash" size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <FormField
                      label="Email"
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="First Name"
                        required
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                      
                      <FormField
                        label="Last Name"
                        required
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    
                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />

                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <ApperIcon name="Loader" size={16} className="mr-2 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <ApperIcon name="CreditCard" size={16} className="mr-2" />
                          Complete Order
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;