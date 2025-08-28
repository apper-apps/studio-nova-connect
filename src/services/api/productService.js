class ProductService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'product_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "sizes_c" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Parse sizes_c field from multiline text to JSON array
const products = response.data?.map(product => {
        let sizes = [];
        if (product.sizes_c) {
          try {
            sizes = JSON.parse(product.sizes_c);
          } catch (error) {
            console.warn('Failed to parse sizes_c for product:', product.Id, error);
            sizes = [];
          }
        }
        return {
          ...product,
          category: product.category_c,
          sizes: sizes
        };
      }) || [];

      return products;
    } catch (error) {
      console.error("Error fetching products:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "sizes_c" } }
        ]
      };

const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        if (response.message === "Record does not exist") {
          console.log(`Product with ID ${id} does not exist`);
          return null;
        }
        console.error("Error fetching product by ID:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching product by ID:", error?.response?.data?.message);
      } else {
        console.error("Error fetching product by ID:", error);
      }
return null;
    }
  }

  async create(productData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: productData.name || productData.Name,
          category_c: productData.category || productData.category_c,
          sizes_c: JSON.stringify(productData.sizes || [])
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
          console.error(`Failed to create product ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create product');
        }

        // Transform response data for consistency
let sizes = [];
        if (response.results[0].data.sizes_c) {
          try {
            sizes = JSON.parse(response.results[0].data.sizes_c);
          } catch (error) {
            console.warn('Failed to parse sizes_c for created product:', response.results[0].data.Id, error);
            sizes = [];
          }
        }
        const createdProduct = {
          ...response.results[0].data,
          category: response.results[0].data.category_c,
          sizes: sizes
        };

        return createdProduct;
      }
    } catch (error) {
      console.error("Error creating product:", error.message);
      throw error;
    }
  }

  async update(id, productData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: productData.name || productData.Name,
          category_c: productData.category || productData.category_c,
          sizes_c: JSON.stringify(productData.sizes || [])
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update product ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update product');
        }

        // Transform response data for consistency
let sizes = [];
        if (response.results[0].data.sizes_c) {
          try {
            sizes = JSON.parse(response.results[0].data.sizes_c);
          } catch (error) {
            console.warn('Failed to parse sizes_c for updated product:', response.results[0].data.Id, error);
            sizes = [];
          }
        }
        const updatedProduct = {
          ...response.results[0].data,
          category: response.results[0].data.category_c,
          sizes: sizes
        };

        return updatedProduct;
      }
    } catch (error) {
      console.error("Error updating product:", error.message);
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
      console.error("Error deleting product:", error.message);
      throw error;
    }
  }
}

export default new ProductService();