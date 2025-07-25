import accountsData from "@/services/mockData/accounts.json";

class AccountService {
  constructor() {
    this.accounts = [...accountsData];
    this.nextId = Math.max(...this.accounts.map(account => account.Id), 0) + 1;
  }

  async getAll() {
    await this.delay();
    return [...this.accounts];
  }

  async getById(id) {
    await this.delay();
    if (typeof id !== 'number') {
      throw new Error('Account ID must be a number');
    }
    const account = this.accounts.find(account => account.Id === id);
    if (!account) {
      throw new Error('Account not found');
    }
    return { ...account };
  }

  async create(accountData) {
    await this.delay();
    const newAccount = {
      Id: this.nextId++,
      name: accountData.name,
      platform: accountData.platform,
      username: accountData.username,
      createdDate: new Date().toISOString()
    };
    this.accounts.push(newAccount);
    return { ...newAccount };
  }

  async update(id, accountData) {
    await this.delay();
    if (typeof id !== 'number') {
      throw new Error('Account ID must be a number');
    }
    const index = this.accounts.findIndex(account => account.Id === id);
    if (index === -1) {
      throw new Error('Account not found');
    }
    
    this.accounts[index] = {
      ...this.accounts[index],
      ...accountData,
      Id: id // Ensure ID doesn't change
    };
    return { ...this.accounts[index] };
  }

  async delete(id) {
    await this.delay();
    if (typeof id !== 'number') {
      throw new Error('Account ID must be a number');
    }
    const index = this.accounts.findIndex(account => account.Id === id);
    if (index === -1) {
      throw new Error('Account not found');
    }
    this.accounts.splice(index, 1);
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const accountService = new AccountService();