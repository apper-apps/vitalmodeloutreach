class ModelService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'model';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "link" } },
          { field: { Name: "dateAdded" } },
          { field: { Name: "platform" } },
          { field: { Name: "followedBy" } },
          { field: { Name: "followDate" } },
          { field: { Name: "dmSent" } },
          { field: { Name: "dmSentDate" } },
          { field: { Name: "notes" } },
          { field: { Name: "status" } }
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
        console.error("Error fetching models:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching models:", error.message);
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
          { field: { Name: "dateAdded" } },
          { field: { Name: "platform" } },
          { field: { Name: "followedBy" } },
          { field: { Name: "followDate" } },
          { field: { Name: "dmSent" } },
          { field: { Name: "dmSentDate" } },
          { field: { Name: "notes" } },
          { field: { Name: "status" } }
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
        console.error(`Error fetching model with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching model with ID ${id}:`, error.message);
        throw new Error(error.message);
      }
    }
  }

  async create(modelData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: modelData.Name || modelData.link || '',
          link: modelData.link,
          platform: modelData.platform,
          followedBy: modelData.followedBy || '',
          followDate: modelData.followDate || null,
          dmSent: modelData.dmSent || false,
          dmSentDate: modelData.dmSentDate || null,
          notes: modelData.notes || '',
          status: modelData.status || 'active',
          dateAdded: new Date().toISOString()
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
          console.error(`Failed to create model records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating model:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating model:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async update(id, modelData) {
    try {
      // Only include Updateable fields
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that are being updated
      if (modelData.hasOwnProperty('Name')) updateData.Name = modelData.Name;
      if (modelData.hasOwnProperty('link')) updateData.link = modelData.link;
      if (modelData.hasOwnProperty('platform')) updateData.platform = modelData.platform;
      if (modelData.hasOwnProperty('followedBy')) updateData.followedBy = modelData.followedBy;
      if (modelData.hasOwnProperty('followDate')) updateData.followDate = modelData.followDate;
      if (modelData.hasOwnProperty('dmSent')) updateData.dmSent = modelData.dmSent;
      if (modelData.hasOwnProperty('dmSentDate')) updateData.dmSentDate = modelData.dmSentDate;
      if (modelData.hasOwnProperty('notes')) updateData.notes = modelData.notes;
      if (modelData.hasOwnProperty('status')) updateData.status = modelData.status;

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
          console.error(`Failed to update model records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error updating model:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating model:", error.message);
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
          console.error(`Failed to delete model records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting model:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting model:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async getStats() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "platform" } },
          { field: { Name: "followDate" } },
          { field: { Name: "dmSent" } }
        ],
        aggregators: [
          {
            id: 'TotalModels',
            fields: [{ field: { Name: "Id" }, Function: 'Count' }]
          },
          {
            id: 'TotalFollows',
            fields: [{ field: { Name: "Id" }, Function: 'Count' }],
            where: [{ FieldName: "followDate", Operator: "HasValue", Values: [], Include: true }]
          },
          {
            id: 'TotalDMs',
            fields: [{ field: { Name: "Id" }, Function: 'Count' }],
            where: [{ FieldName: "dmSent", Operator: "EqualTo", Values: [true], Include: true }]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const data = response.data || [];
      const platformBreakdown = data.reduce((acc, model) => {
        acc[model.platform] = (acc[model.platform] || 0) + 1;
        return acc;
      }, {});

      return {
        totalModels: data.length,
        totalFollows: data.filter(m => m.followDate).length,
        totalDMs: data.filter(m => m.dmSent).length,
        platformBreakdown
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching model stats:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching model stats:", error.message);
        throw new Error(error.message);
      }
    }
  }

  async moveToBlacklist(id) {
    try {
      // Get model data first
      const model = await this.getById(id);
      if (!model) throw new Error("Model not found");
      
      // Import blacklistService here to avoid circular dependency
      const { blacklistService } = await import("@/services/api/blacklistService");
      
      // Convert model to blacklist format
      const blacklistData = {
        Name: model.Name || model.link,
        link: model.link,
        platform: model.platform,
        reason: "Moved from models",
        originalDateAdded: model.dateAdded,
        dateAdded: new Date().toISOString()
      };
      
      // Add to blacklist
      await blacklistService.create(blacklistData);
      
      // Remove from models
      await this.delete(id);
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error moving model to blacklist:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error moving model to blacklist:", error.message);
        throw new Error(error.message);
      }
    }
  }

  // Helper method for duplicate detection
  async findByCleanedUrl(url) {
    try {
      const cleanUrl = (inputUrl) => {
        try {
          const urlObj = new URL(inputUrl);
          return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/$/, '');
        } catch (error) {
          return inputUrl;
        }
      };
      
      const cleanedTarget = cleanUrl(url);
      const models = await this.getAll();
      return models.find(model => cleanUrl(model.link) === cleanedTarget);
    } catch (error) {
      console.error("Error finding model by URL:", error.message);
      return null;
    }
  }

  async exportToCsv() {
    try {
      const models = await this.getAll();
      const headers = ['ID', 'Link', 'Platform', 'Date Added', 'Status', 'Follow Date', 'DM Sent', 'Notes'];
      const csvRows = [headers.join(',')];
      
      models.forEach(model => {
        const row = [
          model.Id,
          `"${model.link || ''}"`,
          `"${model.platform || ''}"`,
          `"${model.dateAdded || ''}"`,
          `"${model.status || 'active'}"`,
          `"${model.followDate || ''}"`,
          `"${model.dmSent ? 'Yes' : 'No'}"`,
          `"${model.notes || ''}"`
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    } catch (error) {
      console.error("Error exporting models to CSV:", error.message);
      throw new Error(error.message);
    }
  }

  async exportToJson() {
    try {
      const models = await this.getAll();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalRecords: models.length,
        data: models.map(model => ({
          Id: model.Id,
          link: model.link,
          platform: model.platform,
          dateAdded: model.dateAdded,
          status: model.status || 'active',
          followDate: model.followDate || null,
          dmSent: model.dmSent || false,
          notes: model.notes || ''
        }))
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting models to JSON:", error.message);
      throw new Error(error.message);
    }
  }
}
export const modelService = new ModelService();