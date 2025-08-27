class ImagePlacementService {
  constructor() {
    this.tableName = 'imageplacement_c';
  }

  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "walldesign_id_c" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "x_coordinate_c" } },
          { field: { Name: "y_coordinate_c" } },
          { field: { Name: "width_c" } },
          { field: { Name: "height_c" } },
          { field: { Name: "crop_details_c" } }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "ASC" }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching image placements:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "walldesign_id_c" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "x_coordinate_c" } },
          { field: { Name: "y_coordinate_c" } },
          { field: { Name: "width_c" } },
          { field: { Name: "height_c" } },
          { field: { Name: "crop_details_c" } }
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching image placement ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getByWallDesignId(wallDesignId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "walldesign_id_c" } },
          { field: { Name: "image_id_c" } },
          { field: { Name: "x_coordinate_c" } },
          { field: { Name: "y_coordinate_c" } },
          { field: { Name: "width_c" } },
          { field: { Name: "height_c" } },
          { field: { Name: "crop_details_c" } }
        ],
        where: [{
          FieldName: "walldesign_id_c",
          Operator: "EqualTo",
          Values: [parseInt(wallDesignId)]
        }],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching image placements by wall design:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async create(placementData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: placementData.Name || `Image Placement ${Date.now()}`,
          walldesign_id_c: parseInt(placementData.walldesign_id_c),
          image_id_c: parseInt(placementData.image_id_c),
          x_coordinate_c: placementData.x_coordinate_c,
          y_coordinate_c: placementData.y_coordinate_c,
          width_c: placementData.width_c,
          height_c: placementData.height_c,
          crop_details_c: placementData.crop_details_c || JSON.stringify({
            x: 0, y: 0, width: 1, height: 1,
            blackWhite: false,
            rotation: 0
          })
        }]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create image placement ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }

        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating image placement:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, placementData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          Name: placementData.Name,
          walldesign_id_c: parseInt(placementData.walldesign_id_c),
          image_id_c: parseInt(placementData.image_id_c),
          x_coordinate_c: placementData.x_coordinate_c,
          y_coordinate_c: placementData.y_coordinate_c,
          width_c: placementData.width_c,
          height_c: placementData.height_c,
          crop_details_c: placementData.crop_details_c
        }]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to update image placement ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }

        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating image placement:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to delete image placement ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }

        return response.results.length > 0 && response.results[0].success;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting image placement:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async bulkCreate(placements) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: placements.map(placement => ({
          Name: placement.Name || `Image Placement ${Date.now()}`,
          walldesign_id_c: parseInt(placement.walldesign_id_c),
          image_id_c: parseInt(placement.image_id_c),
          x_coordinate_c: placement.x_coordinate_c,
          y_coordinate_c: placement.y_coordinate_c,
          width_c: placement.width_c,
          height_c: placement.height_c,
          crop_details_c: placement.crop_details_c || JSON.stringify({
            x: 0, y: 0, width: 1, height: 1,
            blackWhite: false,
            rotation: 0
          })
        }))
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create image placements ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }

        return successfulRecords.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error bulk creating image placements:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }
}

export default new ImagePlacementService();