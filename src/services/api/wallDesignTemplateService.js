/**
 * WallDesignTemplate Service
 * Handles all CRUD operations for Wall Design Templates
 */

class WallDesignTemplateService {
  constructor() {
    this.tableName = 'walldesigntemplate_c';
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  // Get all wall design templates
  async getAll() {
    try {
      if (!this.apperClient) {
        this.initializeClient();
      }

      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "Tags"
            }
          },
          {
            field: {
              Name: "Owner"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          },
          {
            field: {
              Name: "CreatedBy"
            }
          },
          {
            field: {
              Name: "ModifiedOn"
            }
          },
          {
            field: {
              Name: "ModifiedBy"
            }
          },
          {
            field: {
              Name: "walldesign_c"
            }
          }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching wall design templates:", error?.response?.data?.message);
      } else {
        console.error("Error fetching wall design templates:", error);
      }
      throw error;
    }
  }

  // Get wall design template by ID
  async getById(id) {
    try {
      if (!this.apperClient) {
        this.initializeClient();
      }

      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "Tags"
            }
          },
          {
            field: {
              Name: "Owner"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          },
          {
            field: {
              Name: "CreatedBy"
            }
          },
          {
            field: {
              Name: "ModifiedOn"
            }
          },
          {
            field: {
              Name: "ModifiedBy"
            }
          },
          {
            field: {
              Name: "walldesign_c"
            }
          }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching wall design template with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching wall design template with ID ${id}:`, error);
      }
      throw error;
    }
  }

  // Create new wall design template
  async create(templateData) {
    try {
      if (!this.apperClient) {
        this.initializeClient();
      }

      // Only include updateable fields
      const params = {
        records: [
          {
            Name: templateData.Name || '',
            Tags: templateData.Tags || '',
            walldesign_c: parseInt(templateData.walldesign_c) || null
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create wall design template ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating wall design template:", error?.response?.data?.message);
      } else {
        console.error("Error creating wall design template:", error);
      }
      throw error;
    }
  }

  // Update wall design template
  async update(id, updateData) {
    try {
      if (!this.apperClient) {
        this.initializeClient();
      }

      // Only include updateable fields
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updateData.Name,
            Tags: updateData.Tags,
            walldesign_c: updateData.walldesign_c ? parseInt(updateData.walldesign_c) : null
          }
        ]
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
          console.error(`Failed to update wall design template ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating wall design template:", error?.response?.data?.message);
      } else {
        console.error("Error updating wall design template:", error);
      }
      throw error;
    }
  }

  // Delete wall design template
  async delete(id) {
    try {
      if (!this.apperClient) {
        this.initializeClient();
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete wall design template ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting wall design template:", error?.response?.data?.message);
      } else {
        console.error("Error deleting wall design template:", error);
      }
      throw error;
    }
  }

  // Get templates by wall design ID
  async getByWallDesignId(wallDesignId) {
    try {
      if (!this.apperClient) {
        this.initializeClient();
      }

      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "Tags"
            }
          },
          {
            field: {
              Name: "Owner"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          },
          {
            field: {
              Name: "walldesign_c"
            }
          }
        ],
        where: [
          {
            FieldName: "walldesign_c",
            Operator: "EqualTo",
            Values: [parseInt(wallDesignId)]
          }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching templates by wall design ID:", error?.response?.data?.message);
      } else {
        console.error("Error fetching templates by wall design ID:", error);
      }
      throw error;
    }
  }
}

// Create and export a single instance
const wallDesignTemplateService = new WallDesignTemplateService();
export default wallDesignTemplateService;