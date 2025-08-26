class GalleryService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'gallery_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "session_date_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [
          { fieldName: "created_at_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform response data for consistency with existing code
      const galleries = response.data?.map(gallery => ({
        ...gallery,
        clientId: gallery.client_id_c?.Id || gallery.client_id_c,
        sessionDate: gallery.session_date_c,
        createdAt: gallery.created_at_c,
        images: [] // Images will be loaded separately
      })) || [];

      return galleries;
    } catch (error) {
      console.error("Error fetching galleries:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "session_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Get images for this gallery
      const imageService = await import('./imageService.js');
      const images = await imageService.default.getByGalleryId(id);

      // Transform response data for consistency
      const gallery = {
        ...response.data,
        clientId: response.data.client_id_c?.Id || response.data.client_id_c,
        sessionDate: response.data.session_date_c,
        createdAt: response.data.created_at_c,
        images: images || []
      };

      return gallery;
    } catch (error) {
      console.error(`Error fetching gallery with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(galleryData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: galleryData.name || galleryData.Name,
          client_id_c: parseInt(galleryData.clientId || galleryData.client_id_c),
          session_date_c: galleryData.sessionDate || galleryData.session_date_c,
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create gallery ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create gallery');
        }

        // Transform response data for consistency
        const createdGallery = {
          ...response.results[0].data,
          clientId: response.results[0].data.client_id_c?.Id || response.results[0].data.client_id_c,
          sessionDate: response.results[0].data.session_date_c,
          createdAt: response.results[0].data.created_at_c,
          images: []
        };

        return createdGallery;
      }
    } catch (error) {
      console.error("Error creating gallery:", error.message);
      throw error;
    }
  }

  async update(id, galleryData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: galleryData.name || galleryData.Name,
          client_id_c: parseInt(galleryData.clientId || galleryData.client_id_c),
          session_date_c: galleryData.sessionDate || galleryData.session_date_c
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update gallery ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update gallery');
        }

        // Transform response data for consistency
        const updatedGallery = {
          ...response.results[0].data,
          clientId: response.results[0].data.client_id_c?.Id || response.results[0].data.client_id_c,
          sessionDate: response.results[0].data.session_date_c,
          createdAt: response.results[0].data.created_at_c
        };

        return updatedGallery;
      }
    } catch (error) {
      console.error("Error updating gallery:", error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting gallery:", error.message);
      throw error;
    }
  }
}

export default new GalleryService();