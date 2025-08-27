class ProductTemplateService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'producttemplate_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "product_c" } }
        ],
        orderBy: [
          { fieldName: "name_c", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform response data for consistency
      const templates = response.data?.map(template => ({
        ...template,
        name: template.name_c || template.Name,
        description: template.description_c,
        productId: template.product_c?.Id || template.product_c
      })) || [];

      return templates;
    } catch (error) {
      console.error("Error fetching product templates:", error.message);
      throw error;
    }
  }

async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "product_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform response data for consistency
      const template = {
        ...response.data,
        name: response.data.name_c || response.data.Name,
        description: response.data.description_c,
        productId: response.data.product_c?.Id || response.data.product_c
      };

      return template;
    } catch (error) {
      console.error(`Error fetching product template with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(templateData) {
try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: templateData.name,
          name_c: templateData.name,
          description_c: templateData.description || '',
          product_c: templateData.productId ? parseInt(templateData.productId) : null
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
          console.error(`Failed to create product template ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create template');
        }

        // Transform response data for consistency
        const createdTemplate = {
          ...response.results[0].data,
          name: response.results[0].data.name_c || response.results[0].data.Name,
          description: response.results[0].data.description_c,
          productId: response.results[0].data.product_c?.Id || response.results[0].data.product_c
        };

        return createdTemplate;
      }
    } catch (error) {
      console.error("Error creating product template:", error.message);
      throw error;
    }
  }

async update(id, templateData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: templateData.name,
          name_c: templateData.name,
          description_c: templateData.description || '',
          product_c: templateData.productId ? parseInt(templateData.productId) : null
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
          console.error(`Failed to update product template ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update template');
        }

        // Transform response data for consistency
        const updatedTemplate = {
          ...response.results[0].data,
          name: response.results[0].data.name_c || response.results[0].data.Name,
          description: response.results[0].data.description_c,
          productId: response.results[0].data.product_c?.Id || response.results[0].data.product_c
        };

        return updatedTemplate;
      }
    } catch (error) {
      console.error("Error updating product template:", error.message);
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
      console.error("Error deleting product template:", error.message);
      throw error;
    }
  }
}

export default new ProductTemplateService();