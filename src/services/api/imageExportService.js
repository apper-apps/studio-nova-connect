class ImageExportService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'image_export_selection_c';
  }

  async createExportSelections(imageIds) {
    try {
      // Create records for tracking export selections
      const records = imageIds.map(imageId => ({
        Name: `Export Selection ${Date.now()}-${imageId}`,
        image_c: parseInt(imageId)
      }));

      const params = {
        records
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create export selections ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          // If some succeeded and some failed, log details but don't throw
          const successfulRecords = response.results.filter(result => result.success);
          console.log(`Created ${successfulRecords.length} export selection records successfully`);
        }

        return response.results.filter(result => result.success).map(result => result.data);
      }
    } catch (error) {
      console.error("Error creating export selections:", error.message);
      throw error;
    }
  }

  async getExportSelections() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "image_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching export selections:", error.message);
      throw error;
    }
  }

  async deleteExportSelection(selectionId) {
    try {
      const params = {
        RecordIds: [parseInt(selectionId)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting export selection:", error.message);
      throw error;
    }
  }

  generateCSV(imageData) {
    if (!imageData || imageData.length === 0) {
      return '';
    }

    // CSV headers
    const headers = [
      'Image ID',
      'Image Name', 
      'Rating',
      'Original URL',
      'Proofing URL',
      'Thumbnail URL',
      'Order',
      'Gallery ID',
      'Export Date'
    ];

    // Generate CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...imageData.map(image => [
        image.Id || image.id || '',
        `"${(image.Name || 'Untitled').replace(/"/g, '""')}"`, // Escape quotes in names
        image.rating_c || image.rating || 'unrated',
        `"${image.original_url_c || image.originalUrl || ''}"`,
        `"${image.proofing_url_c || image.proofingUrl || ''}"`,
        `"${image.thumbnail_url_c || image.thumbnailUrl || ''}"`,
        image.order_c || image.order || '',
        image.gallery_id_c?.Id || image.gallery_id_c || image.galleryId || '',
        new Date().toISOString()
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  // Utility method to format image data for export
  formatImageForExport(image) {
    return {
      id: image.Id || image.id,
      name: image.Name || 'Untitled',
      rating: image.rating_c || image.rating || 'unrated',
      originalUrl: image.original_url_c || image.originalUrl || '',
      proofingUrl: image.proofing_url_c || image.proofingUrl || '',
      thumbnailUrl: image.thumbnail_url_c || image.thumbnailUrl || '',
      order: image.order_c || image.order || 0,
      galleryId: image.gallery_id_c?.Id || image.gallery_id_c || image.galleryId || ''
    };
  }

  // Bulk export multiple galleries
  async exportMultipleGalleries(galleryIds) {
    try {
      const allImages = [];
      
      for (const galleryId of galleryIds) {
        // This would require imageService to have a method to get images by gallery
        // For now, we'll just track the export intent
        await this.createExportSelections([`gallery-${galleryId}`]);
      }

      return allImages;
    } catch (error) {
      console.error("Error exporting multiple galleries:", error.message);
      throw error;
    }
  }
}

export default new ImageExportService();