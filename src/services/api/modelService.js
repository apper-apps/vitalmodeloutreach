import modelsData from "@/services/mockData/models.json";

class ModelService {
  constructor() {
    this.models = [...modelsData];
  }

  async getAll() {
    await this.delay();
    return [...this.models];
  }

  async getById(id) {
    await this.delay();
    return this.models.find(model => model.Id === parseInt(id));
  }

  async create(modelData) {
    await this.delay();
    
    const newModel = {
      Id: Math.max(...this.models.map(m => m.Id), 0) + 1,
      ...modelData,
      dateAdded: new Date().toISOString(),
      status: "active"
    };
    
    this.models.unshift(newModel);
    return { ...newModel };
  }

async update(id, modelData) {
    await this.delay();
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) throw new Error("Invalid model ID");
    
    const index = this.models.findIndex(model => model.Id === parsedId);
    if (index === -1) throw new Error("Model not found");
    
    this.models[index] = { ...this.models[index], ...modelData };
    return { ...this.models[index] };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.models.findIndex(model => model.Id === parseInt(id));
    if (index === -1) throw new Error("Model not found");
    
    this.models.splice(index, 1);
    return true;
  }

  async getStats() {
    await this.delay();
    
    const totalModels = this.models.length;
    const totalFollows = this.models.filter(m => m.followDate).length;
    const totalDMs = this.models.filter(m => m.dmSent).length;
    
    const platformBreakdown = this.models.reduce((acc, model) => {
      acc[model.platform] = (acc[model.platform] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalModels,
      totalFollows,
      totalDMs,
      platformBreakdown
    };
  }
async moveToBlacklist(id) {
    await this.delay();
    
    // Import blacklistService here to avoid circular dependency
    const { blacklistService } = await import("@/services/api/blacklistService");
    
    const model = this.models.find(m => m.Id === parseInt(id));
    if (!model) throw new Error("Model not found");
    
    // Convert model to blacklist format
    const blacklistData = {
      link: model.link,
      platform: model.platform,
      reason: "Moved from models",
      originalDateAdded: model.dateAdded
    };
    
    // Add to blacklist
    await blacklistService.create(blacklistData);
    
    // Remove from models
    const index = this.models.findIndex(m => m.Id === parseInt(id));
    this.models.splice(index, 1);
    
    return true;
}

  // Helper method for duplicate detection
  async findByCleanedUrl(url) {
    await this.delay();
    
    const cleanUrl = (inputUrl) => {
      try {
        const urlObj = new URL(inputUrl);
        return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/$/, '');
      } catch (error) {
        return inputUrl;
      }
    };
    
    const cleanedTarget = cleanUrl(url);
    return this.models.find(model => cleanUrl(model.link) === cleanedTarget);
  }

async exportToCsv() {
    await this.delay();
    
    const headers = ['ID', 'Link', 'Platform', 'Date Added', 'Status', 'Follow Date', 'DM Sent', 'Notes'];
    const csvRows = [headers.join(',')];
    
    this.models.forEach(model => {
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
  }

  async exportToJson() {
    await this.delay();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: this.models.length,
      data: this.models.map(model => ({
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
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const modelService = new ModelService();