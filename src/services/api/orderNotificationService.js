class OrderNotificationService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'order_notification_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "notification_date_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "notification_type_c" } },
          { field: { Name: "notification_status_c" } },
          { field: { Name: "photographer_c" } },
          { field: { Name: "notification_content_c" } }
        ],
        orderBy: [
          {
            fieldName: "notification_date_c",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching order notifications:", error?.response?.data?.message);
      } else {
        console.error("Error fetching order notifications:", error);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "notification_date_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "notification_type_c" } },
          { field: { Name: "notification_status_c" } },
          { field: { Name: "photographer_c" } },
          { field: { Name: "notification_content_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching notification with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching notification with ID ${id}:`, error);
      }
      return null;
    }
  }

  async create(notificationData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: notificationData.Name || notificationData.name,
          notification_date_c: notificationData.notification_date_c || new Date().toISOString(),
          order_c: parseInt(notificationData.order_c || notificationData.orderId),
          notification_type_c: notificationData.notification_type_c || 'Order Placed',
          notification_status_c: notificationData.notification_status_c || 'Sent',
          photographer_c: notificationData.photographer_c || notificationData.photographerId,
          notification_content_c: notificationData.notification_content_c || notificationData.content
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
          console.error(`Failed to create order notification ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create notification');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating order notification:", error.message);
      throw error;
    }
  }

  async update(id, notificationData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: notificationData.Name || notificationData.name,
          notification_date_c: notificationData.notification_date_c,
          order_c: notificationData.order_c ? parseInt(notificationData.order_c) : undefined,
          notification_type_c: notificationData.notification_type_c,
          notification_status_c: notificationData.notification_status_c,
          photographer_c: notificationData.photographer_c,
          notification_content_c: notificationData.notification_content_c
        }]
      };

      // Remove undefined fields
      Object.keys(params.records[0]).forEach(key => {
        if (params.records[0][key] === undefined) {
          delete params.records[0][key];
        }
      });

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update order notification ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update notification');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating order notification:", error.message);
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

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete order notification ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete notification');
        }

        return true;
      }
    } catch (error) {
      console.error("Error deleting order notification:", error.message);
      throw error;
    }
  }

  async markAsRead(id) {
    return this.update(id, { notification_status_c: 'Read' });
  }

  async getUnreadCount() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } }
        ],
        where: [
          {
            FieldName: "notification_status_c",
            Operator: "EqualTo",
            Values: ["Sent"]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response?.data?.length || 0;
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }
  }
}

export default new OrderNotificationService();