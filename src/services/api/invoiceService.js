class InvoiceService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'invoice_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "invoice_number_c" } },
          { field: { Name: "client_c" } },
          { field: { Name: "invoice_date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "total_amount_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "sales_opportunity_c" } },
          { field: { Name: "file_path_c" } },
          { field: { Name: "payments_received_c" } },
          { field: { Name: "balance_due_c" } },
          { field: { Name: "legal_clause_c" } }
        ],
        orderBy: [
          { fieldName: "invoice_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching invoices:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "invoice_number_c" } },
          { field: { Name: "client_c" } },
          { field: { Name: "invoice_date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "total_amount_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "sales_opportunity_c" } },
          { field: { Name: "file_path_c" } },
          { field: { Name: "payments_received_c" } },
          { field: { Name: "balance_due_c" } },
          { field: { Name: "legal_clause_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        if (response.message === "Record does not exist") {
          console.log(`Invoice with ID ${id} does not exist`);
          return null;
        }
        console.error("Error fetching invoice by ID:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching invoice by ID:", error?.response?.data?.message);
      } else {
        console.error("Error fetching invoice by ID:", error);
      }
      return null;
    }
  }

  async create(invoiceData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: invoiceData.Name || invoiceData.name || `Invoice ${invoiceData.invoice_number_c}`,
          invoice_number_c: invoiceData.invoice_number_c || invoiceData.invoiceNumber,
          client_c: parseInt(invoiceData.client_c || invoiceData.clientId || 1),
          invoice_date_c: invoiceData.invoice_date_c || invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
          due_date_c: invoiceData.due_date_c || invoiceData.dueDate,
          total_amount_c: parseFloat(invoiceData.total_amount_c || invoiceData.totalAmount || 0),
          status_c: invoiceData.status_c || invoiceData.status || "Unpaid",
          sales_opportunity_c: invoiceData.sales_opportunity_c ? parseInt(invoiceData.sales_opportunity_c) : undefined,
          file_path_c: invoiceData.file_path_c || invoiceData.filePath || "",
          payments_received_c: parseFloat(invoiceData.payments_received_c || invoiceData.paymentsReceived || 0),
          balance_due_c: parseFloat(invoiceData.balance_due_c || invoiceData.balanceDue || 0),
          legal_clause_c: invoiceData.legal_clause_c || invoiceData.legalClause || "All sales are final. Digital files are delivered within 2-3 business days of full payment. Print orders require 5-7 business days for processing. Client is responsible for any applicable taxes. By signing below, client agrees to these terms and conditions."
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
          console.error(`Failed to create invoice ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create invoice');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating invoice:", error.message);
      throw error;
    }
  }

  async update(id, invoiceData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: invoiceData.Name || invoiceData.name,
          invoice_number_c: invoiceData.invoice_number_c || invoiceData.invoiceNumber,
          client_c: parseInt(invoiceData.client_c || invoiceData.clientId),
          invoice_date_c: invoiceData.invoice_date_c || invoiceData.invoiceDate,
          due_date_c: invoiceData.due_date_c || invoiceData.dueDate,
          total_amount_c: parseFloat(invoiceData.total_amount_c || invoiceData.totalAmount || 0),
          status_c: invoiceData.status_c || invoiceData.status,
          sales_opportunity_c: invoiceData.sales_opportunity_c ? parseInt(invoiceData.sales_opportunity_c) : undefined,
          file_path_c: invoiceData.file_path_c || invoiceData.filePath,
          payments_received_c: parseFloat(invoiceData.payments_received_c || invoiceData.paymentsReceived || 0),
          balance_due_c: parseFloat(invoiceData.balance_due_c || invoiceData.balanceDue || 0),
          legal_clause_c: invoiceData.legal_clause_c || invoiceData.legalClause
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
          console.error(`Failed to update invoice ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update invoice');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating invoice:", error.message);
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
      console.error("Error deleting invoice:", error.message);
      throw error;
    }
  }

  // Helper method to generate invoice number
  generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  // Helper method to calculate due date (30 days from invoice date)
  calculateDueDate(invoiceDate = new Date()) {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString().split('T')[0];
  }
}

export default new InvoiceService();