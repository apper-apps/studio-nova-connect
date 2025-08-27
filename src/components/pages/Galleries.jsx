import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { format } from "date-fns";
import galleryService from "@/services/api/galleryService";
import clientService from "@/services/api/clientService";

const Galleries = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  
  // Form states
  const [galleryForm, setGalleryForm] = useState({
    name: "",
    clientId: "",
    sessionDate: ""
  });
  const [clientForm, setClientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
if (searchQuery.trim() === "") {
      setFilteredGalleries(galleries);
    } else {
      const filtered = galleries.filter(gallery => {
        const client = clients.find(c => c.Id === gallery.clientId);
        const clientName = client ? `${client.first_name_c} ${client.last_name_c}` : "";
        return gallery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               clientName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredGalleries(filtered);
    }
  }, [searchQuery, galleries, clients]);

  const loadData = async () => {
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
      setError("Failed to load galleries. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGallery = async (e) => {
    e.preventDefault();
    
    if (!galleryForm.name || !galleryForm.clientId || !galleryForm.sessionDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newGallery = await galleryService.create({
        name: galleryForm.name,
        clientId: galleryForm.clientId,
        sessionDate: galleryForm.sessionDate,
        images: []
      });

      setGalleries(prev => [newGallery, ...prev]);
      setShowCreateModal(false);
      setGalleryForm({ name: "", clientId: "", sessionDate: "" });
      toast.success("Gallery created successfully!");
    } catch (err) {
      toast.error("Failed to create gallery");
      console.error("Error creating gallery:", err);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    
    if (!clientForm.firstName || !clientForm.lastName || !clientForm.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newClient = await clientService.create(clientForm);
      setClients(prev => [newClient, ...prev]);
      setShowClientModal(false);
      setClientForm({ firstName: "", lastName: "", email: "", notes: "" });
      toast.success("Client created successfully!");
    } catch (err) {
      toast.error("Failed to create client");
      console.error("Error creating client:", err);
    }
  };

const getClientName = (clientId) => {
    const client = clients.find(c => c.Id === clientId);
    return client ? `${client.first_name_c} ${client.last_name_c}` : "Unknown Client";
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
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Galleries</h1>
          <p className="text-gray-600 mt-1">Manage client photo galleries and sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowClientModal(true)}>
            <ApperIcon name="UserPlus" size={16} className="mr-2" />
            New Client
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Gallery
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search galleries or clients..."
        />
      </div>

      {/* Galleries Grid */}
      {filteredGalleries.length === 0 ? (
        <Empty
          icon="Images"
          title={searchQuery ? "No galleries found" : "No galleries yet"}
          description={searchQuery ? "Try adjusting your search terms." : "Create your first client gallery to get started."}
          actionLabel={!searchQuery ? "Create Gallery" : undefined}
          onAction={!searchQuery ? () => setShowCreateModal(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredGalleries.map((gallery, index) => {
            const stats = getGalleryStats(gallery);
            
            return (
<motion.div
                key={gallery.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative"
              >
                {gallery.shareableUrl && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 bg-success text-white text-xs rounded-full">
                      <ApperIcon name="Globe" size={12} />
                      Published
                    </div>
                  </div>
                )}
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{gallery.name}</CardTitle>
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
      )}

      {/* Create Gallery Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateGallery}>
          <ModalHeader>
            <ModalTitle>Create New Gallery</ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4">
            <FormField
              label="Gallery Name"
              required
              value={galleryForm.name}
              onChange={(e) => setGalleryForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Summer Family Session"
            />
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Client <span className="text-error">*</span>
              </label>
              <select
                required
                value={galleryForm.clientId}
                onChange={(e) => setGalleryForm(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Select Client</option>
{clients.map(client => (
                  <option key={client.Id} value={client.Id}>
                    {client.first_name_c} {client.last_name_c}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="Session Date"
              type="date"
              required
              value={galleryForm.sessionDate}
              onChange={(e) => setGalleryForm(prev => ({ ...prev, sessionDate: e.target.value }))}
            />
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Gallery</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Create Client Modal */}
      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)}>
        <form onSubmit={handleCreateClient}>
          <ModalHeader>
            <ModalTitle>Create New Client</ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4">
            <FormField
              label="First Name"
              required
              value={clientForm.firstName}
              onChange={(e) => setClientForm(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
            />
            
            <FormField
              label="Last Name"
              required
              value={clientForm.lastName}
              onChange={(e) => setClientForm(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Smith"
            />

            <FormField
              label="Email"
              type="email"
              required
              value={clientForm.email}
              onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
            />

            <div>
              <label className="block text-sm font-medium text-primary mb-2">Notes</label>
              <textarea
                value={clientForm.notes}
                onChange={(e) => setClientForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Any special notes about this client..."
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowClientModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Client</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default Galleries;