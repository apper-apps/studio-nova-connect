class GallerySettingService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'gallery_setting_c';
  }

  async getByGalleryId(galleryId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "gallery_id_c" } },
          { field: { Name: "password_c" } },
          { field: { Name: "expiry_date_c" } },
          { field: { Name: "enable_downloads_c" } }
        ],
        where: [
          {
            FieldName: "gallery_id_c",
            Operator: "EqualTo",
            Values: [parseInt(galleryId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const setting = response.data?.[0];
      if (setting) {
        return {
          ...setting,
          galleryId: setting.gallery_id_c?.Id || setting.gallery_id_c,
          password: setting.password_c,
          expiryDate: setting.expiry_date_c,
          enableDownloads: setting.enable_downloads_c
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching gallery setting for gallery ${galleryId}:`, error.message);
      throw error;
    }
  }

  async create(settingData) {
    try {
      const params = {
        records: [{
          // Only include updateable fields
          Name: settingData.name || `Gallery Settings - ${Date.now()}`,
          gallery_id_c: parseInt(settingData.galleryId),
          password_c: settingData.password || "",
          expiry_date_c: settingData.expiryDate || null,
          enable_downloads_c: settingData.enableDownloads || false
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
          console.error(`Failed to create gallery setting ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create gallery setting');
        }

        // Transform response data for consistency
        const createdSetting = {
          ...response.results[0].data,
          galleryId: response.results[0].data.gallery_id_c?.Id || response.results[0].data.gallery_id_c,
          password: response.results[0].data.password_c,
          expiryDate: response.results[0].data.expiry_date_c,
          enableDownloads: response.results[0].data.enable_downloads_c
        };

        return createdSetting;
      }
    } catch (error) {
      console.error("Error creating gallery setting:", error.message);
      throw error;
    }
  }

  async update(id, settingData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include updateable fields
          Name: settingData.name || settingData.Name,
          gallery_id_c: parseInt(settingData.galleryId || settingData.gallery_id_c),
          password_c: settingData.password || settingData.password_c || "",
          expiry_date_c: settingData.expiryDate || settingData.expiry_date_c || null,
          enable_downloads_c: settingData.enableDownloads !== undefined ? settingData.enableDownloads : settingData.enable_downloads_c
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
          console.error(`Failed to update gallery setting ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update gallery setting');
        }

        // Transform response data for consistency
        const updatedSetting = {
          ...response.results[0].data,
          galleryId: response.results[0].data.gallery_id_c?.Id || response.results[0].data.gallery_id_c,
          password: response.results[0].data.password_c,
          expiryDate: response.results[0].data.expiry_date_c,
          enableDownloads: response.results[0].data.enable_downloads_c
        };

        return updatedSetting;
      }
    } catch (error) {
      console.error("Error updating gallery setting:", error.message);
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
      console.error("Error deleting gallery setting:", error.message);
      throw error;
    }
  }

  // Validate gallery access with password and expiry
  validateAccess(setting, password) {
    if (!setting) {
      return { valid: false, reason: "Gallery settings not found" };
    }

    // Check expiry date
    if (setting.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(setting.expiryDate);
      if (now > expiryDate) {
        return { valid: false, reason: "Gallery has expired" };
      }
    }

    // Check password
    if (setting.password && setting.password.trim() !== "") {
      if (password !== setting.password) {
        return { valid: false, reason: "Invalid password" };
      }
    }

    return { valid: true };
  }
}

export default new GallerySettingService();