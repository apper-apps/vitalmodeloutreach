class SettingsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'setting';
    this.settingsId = 1; // Assuming single settings record with ID 1
  }

  async get() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "displayName" } },
          { field: { Name: "email" } },
          { field: { Name: "defaultPlatform" } },
          { field: { Name: "emailNotifications" } },
          { field: { Name: "followReminders" } },
          { field: { Name: "dmReminders" } },
          { field: { Name: "totalModels" } },
          { field: { Name: "platforms" } }
        ]
      };

      // Try to get existing settings record
      const response = await this.apperClient.getRecordById(this.tableName, this.settingsId, params);
      
      if (response.success && response.data) {
        // Parse platforms if it's stored as string
        const settings = { ...response.data };
        if (typeof settings.platforms === 'string') {
          try {
            settings.platforms = JSON.parse(settings.platforms);
          } catch (e) {
            settings.platforms = [];
          }
        }
        return settings;
      } else {
        // Return default settings if no record exists
        return this.getDefaultSettings();
      }
    } catch (error) {
      console.error("Error fetching settings:", error.message);
      // Return default settings on error
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      displayName: "Model Scout",
      email: "scout@modeloutreach.com",
      defaultPlatform: "Instagram",
      emailNotifications: true,
      followReminders: true,
      dmReminders: false,
      totalModels: 0,
      platforms: [
        {
          Id: 1,
          name: "Instagram",
          domain: "instagram.com",
          pillBackgroundColor: "#fdf2f8",
          pillTextColor: "#be185d"
        },
        {
          Id: 2,
          name: "OnlyFans",
          domain: "onlyfans.com",
          pillBackgroundColor: "#dbeafe",
          pillTextColor: "#1d4ed8"
        },
        {
          Id: 3,
          name: "Fansly",
          domain: "fansly.com",
          pillBackgroundColor: "#f3e8ff",
          pillTextColor: "#7c3aed"
        },
        {
          Id: 4,
          name: "TikTok",
          domain: "tiktok.com",
          pillBackgroundColor: "#f3e8ff",
          pillTextColor: "#7c3aed"
        },
        {
          Id: 5,
          name: "Twitter",
          domain: "twitter.com",
          pillBackgroundColor: "#e0f2fe",
          pillTextColor: "#0284c7"
        }
      ]
    };
  }

  async update(newSettings) {
    try {
      // Prepare data with proper field names and formatting
      const updateData = {
        Id: this.settingsId,
        Name: newSettings.Name || "Settings",
        displayName: newSettings.displayName,
        email: newSettings.email,
        defaultPlatform: newSettings.defaultPlatform,
        emailNotifications: newSettings.emailNotifications,
        followReminders: newSettings.followReminders,
        dmReminders: newSettings.dmReminders,
        totalModels: newSettings.totalModels || 0,
        platforms: typeof newSettings.platforms === 'object' 
          ? JSON.stringify(newSettings.platforms) 
          : newSettings.platforms
      };

      // Try to update existing record first
      let response = await this.apperClient.updateRecord(this.tableName, {
        records: [updateData]
      });

      // If update fails (record doesn't exist), create new record
      if (!response.success) {
        const createData = { ...updateData };
        delete createData.Id; // Remove ID for creation
        
        response = await this.apperClient.createRecord(this.tableName, {
          records: [createData]
        });
      }

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to save settings records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        const savedData = successfulRecords[0]?.data;
        
        // Parse platforms back to object if needed
        if (savedData && typeof savedData.platforms === 'string') {
          try {
            savedData.platforms = JSON.parse(savedData.platforms);
          } catch (e) {
            savedData.platforms = [];
          }
        }
        
        return savedData;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating settings:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating settings:", error.message);
        throw new Error(error.message);
      }
    }
  }
}

export const settingsService = new SettingsService();