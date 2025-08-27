import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import paymentService from "@/services/api/paymentService";
import orderService from "@/services/api/orderService";
import orderNotificationService from "@/services/api/orderNotificationService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

// Initialize Stripe (in production, use your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const ShoppingCart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
const [processing, setProcessing] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
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

    // Check if Stripe is available
    setStripeLoaded(!!window.Stripe);
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

// Stripe payment form component
  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
      event.preventDefault();
      
      if (cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
        toast.error("Please fill in all required customer information");
        return;
      }

      if (!stripe || !elements) {
        toast.error("Payment system not ready. Please try again.");
        return;
      }

      const card = elements.getElement(CardElement);
      if (!card) {
        toast.error("Payment card not found. Please refresh the page.");
        return;
      }

      try {
        setPaymentProcessing(true);
        setPaymentError(null);

        const { total } = calculateTotals();
        
        // Create payment intent
        const paymentIntent = await paymentService.createPaymentIntent(
          total,
          'usd',
          {
            customer_email: customerInfo.email,
            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            order_items: cartItems.length
          }
        );

        // Confirm payment with Stripe
        const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: card,
              billing_details: {
                name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: {
                  line1: customerInfo.address.line1,
                  line2: customerInfo.address.line2,
                  city: customerInfo.address.city,
                  state: customerInfo.address.state,
                  postal_code: customerInfo.address.postal_code,
                  country: customerInfo.address.country,
                },
              },
            },
          }
        );

        if (error) {
          console.error('Payment failed:', error);
          setPaymentError(error.message);
          toast.error(`Payment failed: ${error.message}`);
          return;
        }

if (confirmedPayment && confirmedPayment.status === 'succeeded') {
          // Create order record first
          let createdOrder = null;
          try {
            createdOrder = await orderService.create({
              name: `Order ${Date.now()}`,
              order_date_c: new Date().toISOString().split('T')[0],
              total_value_c: total,
              client_c: 1 // Default client - should be updated with actual client in production
            });
          } catch (orderError) {
            console.error('Failed to create order record:', orderError);
          }

          // Create payment record in database
          try {
            await paymentService.create({
              name: `Payment for Order ${Date.now()}`,
              payment_amount_c: total,
              payment_date_c: new Date().toISOString(),
              payment_status_c: 'Completed',
              stripe_transaction_id_c: confirmedPayment.id
            });
          } catch (dbError) {
            console.error('Failed to save payment record:', dbError);
          }

          // Create order notification for photographer
          if (createdOrder) {
            try {
              const orderTotal = total.toFixed(2);
              const itemCount = cartItems.length;
              const notificationContent = `New order received: ${itemCount} item(s) totaling $${orderTotal}. Payment processed successfully via Stripe.`;
              
              await orderNotificationService.create({
                Name: `Order Notification - ${new Date().toLocaleDateString()}`,
                notification_date_c: new Date().toISOString(),
                order_c: createdOrder.Id,
                notification_type_c: 'Order Placed',
                notification_status_c: 'Sent',
                notification_content_c: notificationContent
              });

              // Simulate email notification via toast (in production, this would trigger actual email)
              toast.info(`📧 Order notification email sent to photographer for order #${createdOrder.Id}`);
            } catch (notificationError) {
              console.error('Failed to create order notification:', notificationError);
              // Don't fail the transaction for notification errors
            }
          }

          // Clear cart and redirect
          setCartItems([]);
          localStorage.removeItem('photographyCart');
          
          toast.success("Payment successful! Your order has been placed and the photographer has been notified.");
          navigate('/order-confirmation', { 
            state: { 
              orderTotal: total,
              orderItems: cartItems,
              paymentId: confirmedPayment.id,
              orderId: createdOrder?.Id
            }
          });
        }

      } catch (err) {
        console.error("Payment error:", err);
        setPaymentError(err.message || "Payment processing failed");
        toast.error("Payment failed. Please try again.");
      } finally {
        setPaymentProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="CreditCard" size={20} />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <CardElement options={cardElementOptions} />
              </div>
              {paymentError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {paymentError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || paymentProcessing}
          className="w-full"
          size="lg"
        >
          {paymentProcessing ? (
            <>
              <ApperIcon name="Loader2" size={20} className="mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <ApperIcon name="Lock" size={20} className="mr-2" />
              Pay ${calculateTotals().total.toFixed(2)}
            </>
          )}
        </Button>
      </form>
    );
  };

  const totals = calculateTotals();

  if (loading) {
return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-primary-dark">Shopping Cart</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">Review your items and complete your purchase</p>
        </div>

        {cartItems.length === 0 ? (
          <Empty
            title="Your cart is empty"
            description="Add some photos to your cart to get started"
            actionText="Browse Gallery"
            actionHref="/gallery"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-surface-600 dark:text-surface-400">
                            {item.size} - ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                        >
                          <ApperIcon name="X" size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      required
                      value={customerInfo.firstName}
                      onChange={(value) => setCustomerInfo(prev => ({ ...prev, firstName: value }))}
                    />
                    <FormField
                      label="Last Name"
                      required
                      value={customerInfo.lastName}
                      onChange={(value) => setCustomerInfo(prev => ({ ...prev, lastName: value }))}
                    />
                    <FormField
                      label="Email"
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(value) => setCustomerInfo(prev => ({ ...prev, email: value }))}
                      className="md:col-span-2"
                    />
                    <FormField
                      label="Phone"
                      value={customerInfo.phone}
                      onChange={(value) => setCustomerInfo(prev => ({ ...prev, phone: value }))}
                      className="md:col-span-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${calculateTotals().tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise}>
                <PaymentForm />
              </Elements>
            </div>
          </div>
        )}
</div>
    </div>
  );
};

export default ShoppingCart;