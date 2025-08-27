class OrderService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'order_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "order_date_c" } },
          { field: { Name: "client_c" } },
          { field: { Name: "total_value_c" } }
        ],
        orderBy: [
          { fieldName: "order_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "order_date_c" } },
          { field: { Name: "client_c" } },
          { field: { Name: "total_value_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        if (response.message === "Record does not exist") {
          console.log(`Order with ID ${id} does not exist`);
          return null;
        }
        console.error("Error fetching order by ID:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching order by ID:", error?.response?.data?.message);
      } else {
        console.error("Error fetching order by ID:", error);
      }
      return null;
    }
  }

  async create(orderData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: orderData.name || orderData.Name,
          order_date_c: orderData.order_date_c || new Date().toISOString().split('T')[0],
          client_c: parseInt(orderData.client_c || orderData.clientId),
          total_value_c: parseFloat(orderData.total_value_c || orderData.totalValue || 0)
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
          console.error(`Failed to create order ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create order');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating order:", error.message);
      throw error;
    }
  }

  async update(id, orderData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: orderData.name || orderData.Name,
          order_date_c: orderData.order_date_c || orderData.orderDate,
          client_c: parseInt(orderData.client_c || orderData.clientId),
          total_value_c: parseFloat(orderData.total_value_c || orderData.totalValue || 0)
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
          console.error(`Failed to update order ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update order');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating order:", error.message);
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
      console.error("Error deleting order:", error.message);
      throw error;
    }
  }
}

export default new OrderService();