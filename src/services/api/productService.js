import productsData from "@/services/mockData/products.json";

class ProductService {
  constructor() {
    this.products = [...productsData];
    this.nextId = Math.max(...this.products.map(p => p.id)) + 1;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.products].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getById(id) {
    await this.delay();
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product, sizes: product.sizes ? [...product.sizes] : [] };
  }

  async create(productData) {
    await this.delay();
    const newProduct = {
      id: this.nextId++,
      ...productData,
      sizes: productData.sizes ? [...productData.sizes] : []
    };
    this.products.push(newProduct);
    return { ...newProduct };
  }

  async update(id, productData) {
    await this.delay();
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    this.products[index] = { 
      ...this.products[index], 
      ...productData,
      sizes: productData.sizes ? [...productData.sizes] : []
    };
    return { ...this.products[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    this.products.splice(index, 1);
    return true;
  }
}

export default new ProductService();