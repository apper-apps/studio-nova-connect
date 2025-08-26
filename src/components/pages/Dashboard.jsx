import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import { format } from "date-fns";
import galleryService from "@/services/api/galleryService";
import clientService from "@/services/api/clientService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [galleriesData, clientsData] = await Promise.all([
        galleryService.getAll(),
        clientService.getAll()
      ]);
      
      setGalleries(galleriesData);
      setClients(clientsData);
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
          title="Welcome to IPS Studio"
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

      {/* Recent Galleries */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-6">Recent Galleries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery, index) => {
            const stats = getGalleryStats(gallery);
            
            return (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{gallery.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/gallery/${gallery.id}`)}
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
                        {getClientName(gallery.clientId)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Calendar" size={14} className="mr-2" />
                        {format(new Date(gallery.sessionDate), "MMM dd, yyyy")}
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
                          onClick={() => navigate(`/gallery/${gallery.id}`)}
                          className="flex-1"
                        >
                          <ApperIcon name="Eye" size={14} className="mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/session?galleryId=${gallery.id}`)}
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