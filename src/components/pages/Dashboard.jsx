import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { format } from "date-fns";
import orderNotificationService from "@/services/api/orderNotificationService";
import toast from "@/utils/toast";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Galleries from "@/components/pages/Galleries";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import clientService from "@/services/api/clientService";
import galleryService from "@/services/api/galleryService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
try {
      setLoading(true);
      setError("");
      
      const [galleriesData, clientsData, notificationsData] = await Promise.all([
        galleryService.getAll(),
        clientService.getAll(),
        orderNotificationService.getAll()
      ]);
      
      setGalleries(galleriesData);
      setClients(clientsData);
      setNotifications(notificationsData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error loading dashboard:", err);
    } finally {
setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Unknown Client";
  };

  const getGalleryStats = (gallery) => {
    const totalImages = gallery.images?.length || 0;
    const ratedImages = gallery.images?.filter(img => img.rating && img.rating !== "unrated").length || 0;
    const yesImages = gallery.images?.filter(img => img.rating === "yes").length || 0;
    
    return { totalImages, ratedImages, yesImages };
  };

  if (loading) {
    return <Loading type="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  if (galleries.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your client galleries and photo sessions</p>
          </div>
          <Button onClick={() => navigate("/galleries")}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Create Gallery
          </Button>
        </div>

        <Empty
          icon="Camera"
title="Welcome to ZenSales"
          description="Start by creating your first client gallery to begin managing photo sessions and sales."
          actionLabel="Create Your First Gallery"
          onAction={() => navigate("/galleries")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your client galleries and photo sessions</p>
        </div>
        <Button onClick={() => navigate("/galleries")}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Gallery
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-accent to-accent/80 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-foreground/80 text-sm">Total Galleries</p>
                <p className="text-3xl font-bold">{galleries.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ApperIcon name="Folder" size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success to-success/80 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-foreground/80 text-sm">Total Images</p>
                <p className="text-3xl font-bold">
                  {galleries.reduce((sum, gallery) => sum + (gallery.images?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ApperIcon name="Images" size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning to-warning/80 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-foreground/80 text-sm">Active Clients</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ApperIcon name="Users" size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

{/* Order Notifications */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Recent Order Notifications</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              {notifications.filter(n => n.notification_status_c === 'Sent').length} unread
            </div>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.slice(0, 5).map((notification, index) => (
              <motion.div
                key={notification.Id || `notification-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                  notification.notification_status_c === 'Sent' ? 'border-l-4 border-l-accent bg-accent/5' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <ApperIcon name="Bell" size={16} className="text-accent" />
                          <span className="font-medium text-sm text-primary">
                            {notification.notification_type_c || 'Order Notification'}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.notification_status_c === 'Sent' 
                              ? 'bg-accent/10 text-accent' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {notification.notification_status_c === 'Sent' ? 'New' : 'Read'}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.notification_content_c || 'New order received'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Clock" size={12} />
                            {notification.notification_date_c 
                              ? format(new Date(notification.notification_date_c), "MMM dd, yyyy 'at' h:mm a")
                              : 'Recently'
                            }
                          </div>
                          {notification.order_c && (
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Package" size={12} />
                              Order #{notification.order_c?.Id || notification.order_c}
                            </div>
                          )}
                        </div>
                      </div>
                      {notification.notification_status_c === 'Sent' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await orderNotificationService.markAsRead(notification.Id);
                              // Refresh notifications
                              const updatedNotifications = await orderNotificationService.getAll();
                              setNotifications(updatedNotifications);
                              toast.success("Notification marked as read");
                            } catch (error) {
                              toast.error("Failed to mark notification as read");
                            }
                          }}
                          className="text-xs"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Galleries */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-6">Recent Galleries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery, index) => {
            const stats = getGalleryStats(gallery);
            
            return (
              <motion.div
                key={gallery.Id || `gallery-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{gallery.Name || gallery.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/gallery/${gallery.Id || gallery.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ApperIcon name="ExternalLink" size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="User" size={14} className="mr-2" />
                        {getClientName(gallery.client_id_c || gallery.clientId)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Calendar" size={14} className="mr-2" />
                        {gallery.session_date_c 
                          ? format(new Date(gallery.session_date_c), "MMM dd, yyyy")
                          : format(new Date(gallery.sessionDate || Date.now()), "MMM dd, yyyy")
                        }
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{stats.totalImages}</p>
                          <p className="text-xs text-gray-600">Images</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-accent">{stats.ratedImages}</p>
                          <p className="text-xs text-gray-600">Rated</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success">{stats.yesImages}</p>
                          <p className="text-xs text-gray-600">Favorites</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/gallery/${gallery.Id || gallery.id}`)}
                          className="flex-1"
                        >
                          <ApperIcon name="Eye" size={14} className="mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/session?galleryId=${gallery.Id || gallery.id}`)}
                          className="flex-1"
                        >
                          <ApperIcon name="Play" size={14} className="mr-2" />
                          Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;