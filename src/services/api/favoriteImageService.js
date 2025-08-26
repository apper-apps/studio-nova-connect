class FavoriteImageService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'favorite_image_c';
  }

  async getByGalleryId(galleryId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "gallery_id_c" } }
        ],
        where: [
          {
            FieldName: "gallery_id_c",
            Operator: "EqualTo",
            Values: [parseInt(galleryId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const favorites = response.data?.map(fav => ({
        ...fav,
        clientId: fav.client_id_c?.Id || fav.client_id_c,
        imageId: fav.image_id_c?.Id || fav.image_id_c,
        galleryId: fav.gallery_id_c?.Id || fav.gallery_id_c
      })) || [];

      return favorites;
    } catch (error) {
      console.error(`Error fetching favorites for gallery ${galleryId}:`, error.message);
      throw error;
    }
  }

  async getByClientAndGallery(clientId, galleryId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "gallery_id_c" } }
        ],
        where: [
          {
            FieldName: "client_id_c",
            Operator: "EqualTo",
            Values: [parseInt(clientId)]
          },
          {
            FieldName: "gallery_id_c", 
            Operator: "EqualTo",
            Values: [parseInt(galleryId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const favorites = response.data?.map(fav => ({
        ...fav,
        clientId: fav.client_id_c?.Id || fav.client_id_c,
        imageId: fav.image_id_c?.Id || fav.image_id_c,
        galleryId: fav.gallery_id_c?.Id || fav.gallery_id_c
      })) || [];

      return favorites;
    } catch (error) {
      console.error(`Error fetching favorites for client ${clientId} and gallery ${galleryId}:`, error.message);
      throw error;
    }
  }

  async addFavorite(clientId, imageId, galleryId) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: `Favorite - ${Date.now()}`,
          client_id_c: parseInt(clientId),
          image_id_c: parseInt(imageId),
          gallery_id_c: parseInt(galleryId)
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
          console.error(`Failed to create favorite ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to add favorite');
        }

        // Transform response data for consistency
        const createdFavorite = {
          ...response.results[0].data,
          clientId: response.results[0].data.client_id_c?.Id || response.results[0].data.client_id_c,
          imageId: response.results[0].data.image_id_c?.Id || response.results[0].data.image_id_c,
          galleryId: response.results[0].data.gallery_id_c?.Id || response.results[0].data.gallery_id_c
        };

        return createdFavorite;
      }
    } catch (error) {
      console.error("Error adding favorite:", error.message);
      throw error;
    }
  }

  async removeFavorite(clientId, imageId, galleryId) {
    try {
      // First find the favorite record
      const favorites = await this.getByClientAndGallery(clientId, galleryId);
      const favorite = favorites.find(fav => fav.imageId === parseInt(imageId));

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      const params = {
        RecordIds: [parseInt(favorite.Id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error removing favorite:", error.message);
      throw error;
    }
  }

  async isFavorite(clientId, imageId, galleryId) {
    try {
      const favorites = await this.getByClientAndGallery(clientId, galleryId);
      return favorites.some(fav => fav.imageId === parseInt(imageId));
    } catch (error) {
      console.error("Error checking favorite status:", error.message);
      return false;
    }
  }
}

export default new FavoriteImageService();