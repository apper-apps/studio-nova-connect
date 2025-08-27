class PaymentService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'payment_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "payment_amount_c" } },
          { field: { Name: "payment_date_c" } },
          { field: { Name: "payment_status_c" } },
          { field: { Name: "client_c" } },
{ field: { Name: "sales_opportunity_c" } },
          { field: { Name: "stripe_transaction_id_c" } },
          { field: { Name: "payment_method_c" } }
        ],
        orderBy: [
          { fieldName: "payment_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching payments:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "payment_amount_c" } },
          { field: { Name: "payment_date_c" } },
          { field: { Name: "payment_status_c" } },
          { field: { Name: "client_c" } },
{ field: { Name: "sales_opportunity_c" } },
          { field: { Name: "stripe_transaction_id_c" } },
          { field: { Name: "payment_method_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        if (response.message === "Record does not exist") {
          console.log(`Payment with ID ${id} does not exist`);
          return null;
        }
        console.error("Error fetching payment by ID:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching payment by ID:", error?.response?.data?.message);
      } else {
        console.error("Error fetching payment by ID:", error);
      }
      return null;
    }
  }

  async create(paymentData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: paymentData.name || paymentData.Name || `Payment ${Date.now()}`,
          payment_amount_c: parseFloat(paymentData.payment_amount_c || paymentData.amount || 0),
          payment_date_c: paymentData.payment_date_c || new Date().toISOString(),
          payment_status_c: paymentData.payment_status_c || paymentData.status || 'Completed',
client_c: paymentData.client_c ? parseInt(paymentData.client_c) : null,
          sales_opportunity_c: paymentData.sales_opportunity_c ? parseInt(paymentData.sales_opportunity_c) : null,
          stripe_transaction_id_c: paymentData.stripe_transaction_id_c || paymentData.stripeTransactionId,
          payment_method_c: paymentData.payment_method_c || paymentData.paymentMethod || "Cash"
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
          console.error(`Failed to create payment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create payment');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating payment:", error.message);
      throw error;
    }
  }

  async update(id, paymentData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: paymentData.name || paymentData.Name,
          payment_amount_c: parseFloat(paymentData.payment_amount_c || paymentData.amount || 0),
          payment_date_c: paymentData.payment_date_c || paymentData.paymentDate,
          payment_status_c: paymentData.payment_status_c || paymentData.status,
client_c: paymentData.client_c ? parseInt(paymentData.client_c) : null,
          sales_opportunity_c: paymentData.sales_opportunity_c ? parseInt(paymentData.sales_opportunity_c) : null,
          stripe_transaction_id_c: paymentData.stripe_transaction_id_c || paymentData.stripeTransactionId,
          payment_method_c: paymentData.payment_method_c || paymentData.paymentMethod
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
          console.error(`Failed to update payment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update payment');
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating payment:", error.message);
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
      console.error("Error deleting payment:", error.message);
      throw error;
    }
  }

  // Stripe integration methods
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      // In production, this would call your backend API to create payment intent
      // For now, we'll simulate the Stripe payment intent creation
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        status: 'requires_payment_method'
      };

      return paymentIntent;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }
}

export default new PaymentService();