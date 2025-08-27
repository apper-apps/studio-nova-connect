class OrderLineItemService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'order_line_item_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "product_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "quantity_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "thumbnail_url_c" } },
          { field: { Name: "special_requests_c" } },
          { field: { Name: "line_item_type_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "value_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching order line items:", error.message);
      throw error;
    }
  }

  async getByOrderId(orderId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "product_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "quantity_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "thumbnail_url_c" } },
          { field: { Name: "special_requests_c" } },
          { field: { Name: "line_item_type_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "value_c" } }
        ],
        where: [
          {
            FieldName: "order_c",
            Operator: "EqualTo",
            Values: [parseInt(orderId)]
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
      console.error("Error fetching order line items by order ID:", error.message);
      throw error;
    }
  }

  async create(lineItemData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: lineItemData.name || lineItemData.Name || `Line Item ${Date.now()}`,
          product_c: lineItemData.product_c ? parseInt(lineItemData.product_c) : null,
          order_c: parseInt(lineItemData.order_c || lineItemData.orderId),
          quantity_c: parseInt(lineItemData.quantity_c || lineItemData.quantity || 1),
          price_c: parseFloat(lineItemData.price_c || lineItemData.price || 0),
          thumbnail_url_c: lineItemData.thumbnail_url_c || lineItemData.thumbnailUrl || "",
          special_requests_c: lineItemData.special_requests_c || lineItemData.specialRequests || "",
          line_item_type_c: lineItemData.line_item_type_c || lineItemData.lineItemType || "Product",
          description_c: lineItemData.description_c || lineItemData.description || "",
          value_c: parseFloat(lineItemData.value_c || lineItemData.value || 0)
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
          console.error(`Failed to create order line item ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create order line item');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating order line item:", error.message);
      throw error;
    }
  }

  async createBulk(lineItemsData) {
    try {
      const params = {
        records: lineItemsData.map(item => ({
          // Only include updateable fields
          Name: item.name || item.Name || `Line Item ${Date.now()}`,
          product_c: item.product_c ? parseInt(item.product_c) : null,
          order_c: parseInt(item.order_c || item.orderId),
          quantity_c: parseInt(item.quantity_c || item.quantity || 1),
          price_c: parseFloat(item.price_c || item.price || 0),
          thumbnail_url_c: item.thumbnail_url_c || item.thumbnailUrl || "",
          special_requests_c: item.special_requests_c || item.specialRequests || "",
          line_item_type_c: item.line_item_type_c || item.lineItemType || "Product",
          description_c: item.description_c || item.description || "",
          value_c: parseFloat(item.value_c || item.value || 0)
        }))
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
          console.error(`Failed to create order line items ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        return successfulRecords.map(result => result.data);
      }
    } catch (error) {
      console.error("Error creating order line items:", error.message);
      throw error;
    }
  }

  async update(id, lineItemData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: lineItemData.name || lineItemData.Name,
          product_c: lineItemData.product_c ? parseInt(lineItemData.product_c) : null,
          order_c: parseInt(lineItemData.order_c || lineItemData.orderId),
          quantity_c: parseInt(lineItemData.quantity_c || lineItemData.quantity || 1),
          price_c: parseFloat(lineItemData.price_c || lineItemData.price || 0),
          thumbnail_url_c: lineItemData.thumbnail_url_c || lineItemData.thumbnailUrl || "",
          special_requests_c: lineItemData.special_requests_c || lineItemData.specialRequests || "",
          line_item_type_c: lineItemData.line_item_type_c || lineItemData.lineItemType || "Product",
          description_c: lineItemData.description_c || lineItemData.description || "",
          value_c: parseFloat(lineItemData.value_c || lineItemData.value || 0)
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
          console.error(`Failed to update order line item ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update order line item');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating order line item:", error.message);
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
      console.error("Error deleting order line item:", error.message);
      throw error;
    }
  }
}

export default new OrderLineItemService();