import blacklistData from "@/services/mockData/blacklist.json";

class BlacklistService {
  constructor() {
    this.blacklist = [...blacklistData];
  }

  async getAll() {
    await this.delay();
    return [...this.blacklist];
  }

  async getById(id) {
    await this.delay();
    return this.blacklist.find(item => item.Id === parseInt(id));
  }

async create(data) {
    await this.delay();
    
    const newItem = {
      Id: Math.max(...this.blacklist.map(item => item.Id), 0) + 1,
      ...data,
      dateAdded: new Date().toISOString()
    };
    
    this.blacklist.unshift(newItem);
    return { ...newItem };
  }

  async moveToMainList(id) {
    await this.delay();
    
    // Import modelService here to avoid circular dependency
    const { modelService } = await import("@/services/api/modelService");
    
    const blacklistItem = this.blacklist.find(item => item.Id === parseInt(id));
    if (!blacklistItem) throw new Error("Blacklist item not found");
    
    // Convert blacklist item back to model format
    const modelData = {
      link: blacklistItem.link,
      platform: blacklistItem.platform,
      dateAdded: blacklistItem.originalDateAdded || blacklistItem.dateAdded,
      status: "active"
    };
    
    // Add back to models
    await modelService.create(modelData);
    
    // Remove from blacklist
    const index = this.blacklist.findIndex(item => item.Id === parseInt(id));
    this.blacklist.splice(index, 1);
    
    return true;
  }

  async update(id, data) {
    await this.delay();
    
    const index = this.blacklist.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Item not found");
    
    this.blacklist[index] = { ...this.blacklist[index], ...data };
    return { ...this.blacklist[index] };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.blacklist.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Item not found");
    
    this.blacklist.splice(index, 1);
    return true;
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const blacklistService = new BlacklistService();