import { modelService } from "@/services/api/modelService";

class BlacklistService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'blacklist_item';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "link" } },
          { field: { Name: "platform" } },
          { field: { Name: "reason" } },
          { field: { Name: "dateAdded" } },
          { field: { Name: "originalDateAdded" } }
        ],
        orderBy: [
          { fieldName: "dateAdded", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching blacklist:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching blacklist:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "link" } },
          { field: { Name: "platform" } },
          { field: { Name: "reason" } },
          { field: { Name: "dateAdded" } },
          { field: { Name: "originalDateAdded" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching blacklist item with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching blacklist item with ID ${id}:`, error.message);
        throw new Error(error.message);
      }
    }
  }

  async create(data) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: data.Name || data.link || '',
          link: data.link,
          platform: data.platform,
          reason: data.reason || '',
          dateAdded: new Date().toISOString(),
          originalDateAdded: data.originalDateAdded || null
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
          console.error(`Failed to create blacklist records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating blacklist item:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating blacklist item:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async moveToMainList(id) {
    try {
      // Get blacklist item first
      const blacklistItem = await this.getById(id);
      if (!blacklistItem) throw new Error("Blacklist item not found");
      
      // Import modelService here to avoid circular dependency
      const { modelService } = await import("@/services/api/modelService");
      
      // Convert blacklist item back to model format
      const modelData = {
        Name: blacklistItem.Name || blacklistItem.link,
        link: blacklistItem.link,
        platform: blacklistItem.platform,
        dateAdded: blacklistItem.originalDateAdded || blacklistItem.dateAdded,
        status: "active"
      };
      
      // Add back to models
      await modelService.create(modelData);
      
      // Remove from blacklist
      await this.delete(id);
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error moving blacklist item to main list:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error moving blacklist item to main list:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async update(id, data) {
    try {
      // Only include Updateable fields
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that are being updated
      if (data.hasOwnProperty('Name')) updateData.Name = data.Name;
      if (data.hasOwnProperty('link')) updateData.link = data.link;
      if (data.hasOwnProperty('platform')) updateData.platform = data.platform;
      if (data.hasOwnProperty('reason')) updateData.reason = data.reason;
      if (data.hasOwnProperty('originalDateAdded')) updateData.originalDateAdded = data.originalDateAdded;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update blacklist records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating blacklist item:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating blacklist item:", error.message);
        throw new Error(error.message);
      }
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
          console.error(`Failed to delete blacklist records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting blacklist item:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting blacklist item:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async exportToCsv() {
    try {
      const blacklist = await this.getAll();
      const headers = ['ID', 'Link', 'Platform', 'Reason', 'Date Added', 'Original Date Added'];
      const csvRows = [headers.join(',')];
      
      blacklist.forEach(item => {
        const row = [
          item.Id,
          `"${item.link || ''}"`,
          `"${item.platform || ''}"`,
          `"${item.reason || ''}"`,
          `"${item.dateAdded || ''}"`,
          `"${item.originalDateAdded || ''}"`
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    } catch (error) {
      console.error("Error exporting blacklist to CSV:", error.message);
      throw new Error(error.message);
    }
  }

  async exportToJson() {
    try {
      const blacklist = await this.getAll();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalRecords: blacklist.length,
        data: blacklist.map(item => ({
          Id: item.Id,
          link: item.link,
          platform: item.platform,
          reason: item.reason,
          dateAdded: item.dateAdded,
          originalDateAdded: item.originalDateAdded || null
        }))
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting blacklist to JSON:", error.message);
      throw new Error(error.message);
    }
}
}

export const blacklistService = new BlacklistService();