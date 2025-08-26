class ClientService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'client_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [
          { fieldName: "created_at_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching clients:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(clientData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: clientData.Name || `${clientData.first_name_c} ${clientData.last_name_c}`,
          first_name_c: clientData.first_name_c || clientData.firstName,
          last_name_c: clientData.last_name_c || clientData.lastName,
          email_c: clientData.email_c || clientData.email,
          notes_c: clientData.notes_c || clientData.notes || "",
          created_at_c: new Date().toISOString()
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
          console.error(`Failed to create client ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create client');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating client:", error.message);
      throw error;
    }
  }

  async update(id, clientData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: clientData.Name || `${clientData.first_name_c} ${clientData.last_name_c}`,
          first_name_c: clientData.first_name_c || clientData.firstName,
          last_name_c: clientData.last_name_c || clientData.lastName,
          email_c: clientData.email_c || clientData.email,
          notes_c: clientData.notes_c || clientData.notes
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
          console.error(`Failed to update client ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update client');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating client:", error.message);
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
      console.error("Error deleting client:", error.message);
      throw error;
    }
  }
}

export default new ClientService();