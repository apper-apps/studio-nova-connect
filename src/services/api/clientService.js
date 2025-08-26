import clientsData from "@/services/mockData/clients.json";

class ClientService {
  constructor() {
    this.clients = [...clientsData];
    this.nextId = Math.max(...this.clients.map(c => c.id)) + 1;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.clients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getById(id) {
    await this.delay();
    const client = this.clients.find(c => c.id === id);
    if (!client) {
      throw new Error("Client not found");
    }
    return { ...client };
  }

  async create(clientData) {
    await this.delay();
    const newClient = {
      id: this.nextId++,
      ...clientData,
      createdAt: new Date().toISOString()
    };
    this.clients.push(newClient);
    return { ...newClient };
  }

  async update(id, clientData) {
    await this.delay();
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error("Client not found");
    }
    this.clients[index] = { ...this.clients[index], ...clientData };
    return { ...this.clients[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error("Client not found");
    }
    this.clients.splice(index, 1);
    return true;
  }
}

export default new ClientService();