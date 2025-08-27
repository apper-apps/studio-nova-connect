class SizePriceCombinationService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'sizePriceCombination_c';
}

  async getByTemplateId(templateId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "size_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "producttemplate_c" } }
        ],
        where: [
          {
            FieldName: "producttemplate_c",
            Operator: "EqualTo",
            Values: [parseInt(templateId)]
          }
        ],
        orderBy: [
          { fieldName: "size_c", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform response data for consistency
      const combinations = response.data?.map(combo => ({
        ...combo,
        size: combo.size_c,
        price: combo.price_c || 0,
        templateId: combo.producttemplate_c?.Id || combo.producttemplate_c
      })) || [];

      return combinations;
    } catch (error) {
      console.error(`Error fetching size/price combinations for template ${templateId}:`, error.message);
      throw error;
    }
  }

async createForTemplate(templateId, sizePriceData) {
    try {
      const records = sizePriceData.map((item, index) => ({
        Name: `${item.size} - $${item.price}`,
        size_c: item.size,
        price_c: parseFloat(item.price) || 0,
        producttemplate_c: parseInt(templateId)
      }));
      const params = { records };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create size/price combinations ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create size/price combinations');
        }

        // Transform response data for consistency
        const createdCombinations = response.results
          .filter(result => result.success)
          .map(result => ({
            ...result.data,
            size: result.data.size_c,
            price: result.data.price_c || 0,
            templateId: result.data.producttemplate_c?.Id || result.data.producttemplate_c
          }));

        return createdCombinations;
      }
    } catch (error) {
      console.error("Error creating size/price combinations:", error.message);
      throw error;
    }
  }

  async updateForTemplate(templateId, sizePriceData) {
    try {
      // First delete existing combinations
      await this.deleteByTemplateId(templateId);
      
      // Then create new ones
      return await this.createForTemplate(templateId, sizePriceData);
    } catch (error) {
      console.error("Error updating size/price combinations:", error.message);
      throw error;
    }
  }

  async deleteByTemplateId(templateId) {
    try {
      // First get all combinations for this template
      const combinations = await this.getByTemplateId(templateId);
      
      if (combinations.length === 0) {
        return true;
      }

      const recordIds = combinations.map(combo => combo.Id);
      const params = { RecordIds: recordIds };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting size/price combinations for template ${templateId}:`, error.message);
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
      console.error("Error deleting size/price combination:", error.message);
      throw error;
    }
  }
}

export default new SizePriceCombinationService();