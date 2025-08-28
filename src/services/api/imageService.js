class ImageService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'image_c';
  }

  async getByGalleryId(galleryId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "original_url_c" } },
          { field: { Name: "proofing_url_c" } },
          { field: { Name: "thumbnail_url_c" } },
          { field: { Name: "rating_c" } },
          { field: { Name: "order_c" } },
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
        if (response.message === "Record does not exist") {
          console.log(`No images found for gallery ID ${galleryId}`);
          return [];
        }
        console.error("Error fetching images by gallery ID:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching images by gallery ID:", error?.response?.data?.message);
      } else {
        console.error("Error fetching images by gallery ID:", error);
      }
return [];
    }
  }

async update(imageId, data) {
    try {
      const params = {
        records: [{
          Id: parseInt(imageId),
          ...data
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update image ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update image');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating image:", error.message);
      throw error;
    }
  }

  async updateRating(imageId, rating) {
    try {
      const params = {
        records: [{
          Id: parseInt(imageId),
          rating_c: rating
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update image rating ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update image rating');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating image rating:", error.message);
      throw error;
    }
  }
  async create(imageData) {
    try {
      const params = {
        records: [{
          Name: imageData.Name || `Image ${Date.now()}`,
          original_url_c: imageData.originalUrl || imageData.original_url_c,
          proofing_url_c: imageData.proofingUrl || imageData.proofing_url_c,
          thumbnail_url_c: imageData.thumbnailUrl || imageData.thumbnail_url_c,
          rating_c: imageData.rating || imageData.rating_c || "unrated",
order_c: imageData.order_c || imageData.order || 1,
          gallery_id_c: parseInt(imageData.gallery_id_c || imageData.galleryId)
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
          console.error(`Failed to create image ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create image');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating image:", error.message);
      throw error;
    }
  }

  async delete(imageId) {
    try {
      const params = {
        RecordIds: [parseInt(imageId)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting image:", error.message);
throw error;
    }
  }

  async bulkUpdateRating(imageIds, rating) {
    try {
      const records = imageIds.map(id => ({
        Id: parseInt(id),
        rating_c: rating
      }));

      const params = {
        records
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to bulk update image ratings ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          // If some succeeded and some failed, throw error with details
          if (successfulUpdates.length > 0) {
            throw new Error(`Updated ${successfulUpdates.length} images, but ${failedUpdates.length} failed`);
          } else {
            throw new Error(failedUpdates[0].message || 'Failed to update image ratings');
          }
        }

        return response.results.map(result => result.data);
      }
    } catch (error) {
      console.error("Error bulk updating image ratings:", error.message);
      throw error;
    }
  }
}

export default new ImageService();