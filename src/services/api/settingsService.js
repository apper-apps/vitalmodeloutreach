import settingsData from "@/services/mockData/settings.json";

class SettingsService {
  constructor() {
    this.settings = { ...settingsData };
  }

  async get() {
    await this.delay();
    return { ...this.settings };
  }

  async update(newSettings) {
    await this.delay();
    
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const settingsService = new SettingsService();