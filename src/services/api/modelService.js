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
    
    const index = this.models.findIndex(model => model.Id === parseInt(id));
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

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const modelService = new ModelService();