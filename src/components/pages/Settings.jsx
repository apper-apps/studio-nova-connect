import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";
import { format } from "date-fns";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const { user, subscription } = authService.useAuth();
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || ""
  });

  useEffect(() => {
    loadSubscriptionDetails();
  }, []);

  const loadSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const details = await subscriptionService.getSubscriptionDetails(user.id);
      setSubscriptionDetails(details);
    } catch (error) {
      console.error("Error loading subscription details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      await authService.updateProfile(profileForm);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const result = await subscriptionService.createPortalSession(user.id);
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("Failed to access billing portal");
      }
    } catch (error) {
      toast.error(error.message || "Failed to access billing portal");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'past_due':
        return 'text-warning bg-warning/10';
      case 'canceled':
        return 'text-error bg-error/10';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'incomplete':
        return 'Incomplete';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Account & Billing</h1>
        <p className="text-gray-600 mt-2">Manage your profile and subscription settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="User" size={20} />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <FormField
                label="First Name"
                required
                value={profileForm.firstName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
              />

              <FormField
                label="Last Name"
                required
                value={profileForm.lastName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Smith"
              />

              <FormField
                label="Email Address"
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />

              <Button 
                type="submit" 
                disabled={profileLoading}
                className="w-full"
              >
                {profileLoading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="CreditCard" size={20} />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loading />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.status)}`}>
                    {getStatusText(subscription?.status)}
                  </span>
                </div>

                {/* Plan */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">ZenSales Pro</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">$29/month</span>
                </div>

                {/* Next billing date */}
                {subscriptionDetails?.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next billing</span>
                    <span className="font-medium">
                      {format(new Date(subscriptionDetails.currentPeriodEnd * 1000), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}

                {/* Customer since */}
                {user?.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Customer since</span>
                    <span className="font-medium">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleManageBilling}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="ExternalLink" size={16} className="mr-2" />
                        Manage Billing & Payment Methods
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Securely manage your payment methods, view billing history, and cancel your subscription through Stripe's customer portal.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="Star" size={20} />
            Your ZenSales Pro Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "Images", title: "Unlimited Galleries", description: "Create as many client galleries as you need" },
              { icon: "Play", title: "Slideshow Sessions", description: "Professional photo presentation tools" },
              { icon: "Package", title: "Product Management", description: "Manage your pricing and products" },
              { icon: "Heart", title: "Client Ratings", description: "Let clients rate and select their favorites" },
              { icon: "GitCompare", title: "Photo Comparison", description: "Side-by-side photo comparison tools" },
              { icon: "ShoppingCart", title: "Order Management", description: "Track and manage client orders" }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ApperIcon name={feature.icon} size={16} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-primary text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;