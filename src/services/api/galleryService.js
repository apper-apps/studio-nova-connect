import galleriesData from "@/services/mockData/galleries.json";

class GalleryService {
  constructor() {
    this.galleries = [...galleriesData];
    this.nextId = Math.max(...this.galleries.map(g => g.id)) + 1;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.galleries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getById(id) {
    await this.delay();
    const gallery = this.galleries.find(g => g.id === id);
    if (!gallery) {
      throw new Error("Gallery not found");
    }
    return { ...gallery, images: gallery.images ? [...gallery.images] : [] };
  }

  async create(galleryData) {
    await this.delay();
    const newGallery = {
      id: this.nextId++,
      ...galleryData,
      images: galleryData.images || [],
      createdAt: new Date().toISOString()
    };
    this.galleries.push(newGallery);
    return { ...newGallery };
  }

  async update(id, galleryData) {
    await this.delay();
    const index = this.galleries.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error("Gallery not found");
    }
    this.galleries[index] = { ...this.galleries[index], ...galleryData };
    return { ...this.galleries[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.galleries.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error("Gallery not found");
    }
    this.galleries.splice(index, 1);
    return true;
  }

  async addImages(galleryId, images) {
    await this.delay();
    const gallery = this.galleries.find(g => g.id === galleryId);
    if (!gallery) {
      throw new Error("Gallery not found");
    }
    
    const nextImageId = Math.max(...this.galleries.flatMap(g => g.images?.map(img => img.id) || []), 0) + 1;
    const newImages = images.map((image, index) => ({
      id: nextImageId + index,
      galleryId,
      ...image,
      rating: "unrated",
      order: (gallery.images?.length || 0) + index + 1
    }));

    gallery.images = [...(gallery.images || []), ...newImages];
    return { ...gallery };
  }

  async removeImage(galleryId, imageId) {
    await this.delay();
    const gallery = this.galleries.find(g => g.id === galleryId);
    if (!gallery) {
      throw new Error("Gallery not found");
    }
    
    gallery.images = gallery.images?.filter(img => img.id !== imageId) || [];
    return { ...gallery };
  }

  async updateImageRating(galleryId, imageId, rating) {
    await this.delay();
    const gallery = this.galleries.find(g => g.id === galleryId);
    if (!gallery) {
      throw new Error("Gallery not found");
    }
    
    const image = gallery.images?.find(img => img.id === imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    image.rating = rating;
    return { ...gallery };
  }
}

export default new GalleryService();