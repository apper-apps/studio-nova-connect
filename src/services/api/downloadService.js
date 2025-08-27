class DownloadService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'download_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "download_date_c" } },
          { field: { Name: "resolution_option_c" } }
        ],
        orderBy: [
          { fieldName: "download_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const downloads = response.data?.map(download => ({
        ...download,
        imageId: download.image_id_c?.Id || download.image_id_c,
        clientId: download.client_id_c?.Id || download.client_id_c,
        downloadDate: download.download_date_c,
        resolutionOption: download.resolution_option_c
      })) || [];

      return downloads;
    } catch (error) {
      console.error("Error fetching downloads:", error.message);
      throw error;
    }
  }

async getByClientId(clientId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "download_date_c" } },
          { field: { Name: "resolution_option_c" } }
        ],
        where: [
          {
            FieldName: "client_id_c",
            Operator: "EqualTo",
            Values: [parseInt(clientId)]
          }
        ],
        orderBy: [
          { fieldName: "download_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const downloads = response.data?.map(download => ({
        ...download,
        imageId: download.image_id_c?.Id || download.image_id_c,
        clientId: download.client_id_c?.Id || download.client_id_c,
        downloadDate: download.download_date_c,
        resolutionOption: download.resolution_option_c
      })) || [];

      return downloads;
    } catch (error) {
      console.error(`Error fetching downloads for client ${clientId}:`, error.message);
      throw error;
    }
  }

async recordDownload(clientId, imageId, resolutionOption = "high") {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: `Download - ${Date.now()}`,
          image_id_c: parseInt(imageId),
          client_id_c: parseInt(clientId),
          download_date_c: new Date().toISOString(),
          resolution_option_c: resolutionOption
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
          console.error(`Failed to record download ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to record download');
        }

        // Transform response data for consistency
        const createdDownload = {
          ...response.results[0].data,
          imageId: response.results[0].data.image_id_c?.Id || response.results[0].data.image_id_c,
          clientId: response.results[0].data.client_id_c?.Id || response.results[0].data.client_id_c,
          downloadDate: response.results[0].data.download_date_c,
          resolutionOption: response.results[0].data.resolution_option_c
        };

        return createdDownload;
      }
    } catch (error) {
      console.error("Error recording download:", error.message);
      throw error;
    }
  }

async getDownloadsByImage(imageId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "download_date_c" } },
          { field: { Name: "resolution_option_c" } }
        ],
        where: [
          {
            FieldName: "image_id_c",
            Operator: "EqualTo",
            Values: [parseInt(imageId)]
          }
        ],
        orderBy: [
          { fieldName: "download_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const downloads = response.data?.map(download => ({
        ...download,
        imageId: download.image_id_c?.Id || download.image_id_c,
        clientId: download.client_id_c?.Id || download.client_id_c,
        downloadDate: download.download_date_c,
        resolutionOption: download.resolution_option_c
      })) || [];

      return downloads;
    } catch (error) {
      console.error(`Error fetching downloads for image ${imageId}:`, error.message);
      throw error;
    }
  }
}

export default new DownloadService();