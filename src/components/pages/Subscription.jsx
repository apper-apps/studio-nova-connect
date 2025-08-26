import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import { subscriptionService } from "@/services/subscriptionService";
import { authService } from "@/services/authService";

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const { user } = authService.useAuth();

  useEffect(() => {
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => setStripeLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load payment system");
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleSubscribe = async () => {
    if (!stripeLoaded) {
      toast.error("Payment system is still loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const result = await subscriptionService.createSubscription(user.id);
      
      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error) {
      toast.error(error.message || "Failed to start subscription process");
    } finally {
      setLoading(false);
    }
  };

  if (!stripeLoaded) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-accent rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="Camera" size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Complete Your ZenSales Setup
          </h1>
          <p className="text-lg text-gray-600">
            Welcome {user?.firstName}! Choose your subscription plan to get started.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-accent to-accent/80 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">ZenSales Pro</h2>
                <p className="text-accent-foreground/90 mt-1">
                  Everything you need to run your photography business
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$29</div>
                <div className="text-sm text-accent-foreground/80">per month</div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                  What's included:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Unlimited client galleries",
                    "Professional slideshow sessions", 
                    "Product & pricing management",
                    "Client rating & selection tools",
                    "Photo comparison features",
                    "Order management system",
                    "Client dashboard access",
                    "Priority email support"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <ApperIcon name="Check" size={16} className="text-success flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantee */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <ApperIcon name="Shield" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">30-Day Money-Back Guarantee</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Try ZenSales risk-free. Cancel anytime within 30 days for a full refund.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full text-lg py-3"
                size="lg"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Setting up your subscription...
                  </>
                ) : (
                  <>
                    <ApperIcon name="CreditCard" size={20} className="mr-2" />
                    Start Your Subscription - $29/month
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Secure payment powered by Stripe • Cancel anytime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Questions? Contact us at{" "}
            <a href="mailto:support@zensales.com" className="text-accent hover:text-accent/80">
              support@zensales.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;