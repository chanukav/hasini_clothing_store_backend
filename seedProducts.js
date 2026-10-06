require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hasini_clothing_store');
    
    // Clear existing products
    await Product.deleteMany();

    const products = [
      {
        name: "Classic White T-Shirt",
        slug: "classic-white-tshirt",
        description: "A comfortable, breathable, everyday classic white t-shirt. Perfect for any casual occasion.",
        category: "t-shirts",
        price: 1500,
        images: ["https://example.com/images/white-tshirt.jpg"],
        variants: [
          { sku: "TS-WHT-S", size: "S", color: "White", stock: 10 },
          { sku: "TS-WHT-M", size: "M", color: "White", stock: 15 },
          { sku: "TS-WHT-L", size: "L", color: "White", stock: 5 },
        ]
      },
      {
        name: "Oversized Graphic Tee",
        slug: "oversized-graphic-tee",
        description: "Trendy oversized fit with a vibrant graphic print on the back.",
        category: "t-shirts",
        price: 2200,
        images: ["https://example.com/images/graphic-tee.jpg"],
        variants: [
          { sku: "OGT-BLK-M", size: "M", color: "Black", stock: 8 },
          { sku: "OGT-BLK-L", size: "L", color: "Black", stock: 12 },
        ]
      },
      {
        name: "Slim Fit Denim Jeans",
        slug: "slim-fit-denim-jeans",
        description: "Classic slim fit denim tailored for comfort and durability.",
        category: "jeans",
        price: 4500,
        images: ["https://example.com/images/slim-jeans.jpg"],
        variants: [
          { sku: "DNM-BLU-30", size: "30", color: "Blue", stock: 20 },
          { sku: "DNM-BLU-32", size: "32", color: "Blue", stock: 25 },
          { sku: "DNM-BLK-30", size: "30", color: "Black", stock: 10 },
          { sku: "DNM-BLK-32", size: "32", color: "Black", stock: 15 }
        ]
      },
      {
        name: "Summer Floral Dress",
        slug: "summer-floral-dress",
        description: "Lightweight and flowy floral dress for sunny days.",
        category: "dresses",
        price: 3800,
        images: ["https://example.com/images/floral-dress.jpg"],
        variants: [
          { sku: "DRS-FLR-S", size: "S", color: "Red Floral", stock: 5 },
          { sku: "DRS-FLR-M", size: "M", color: "Red Floral", stock: 8 },
          { sku: "DRS-FLR-L", size: "L", color: "Red Floral", stock: 4 }
        ]
      },
      {
        name: "Formal Button-Up Shirt",
        slug: "formal-button-up-shirt",
        description: "Crisp cotton button-up perfect for office wear or formal events.",
        category: "shirts",
        price: 3000,
        images: ["https://example.com/images/button-up.jpg"],
        variants: [
          { sku: "SHR-WHT-15", size: "15", color: "White", stock: 30 },
          { sku: "SHR-WHT-16", size: "16", color: "White", stock: 20 },
          { sku: "SHR-BLU-15", size: "15", color: "Light Blue", stock: 15 }
        ]
      },
      {
        name: "High-Waisted Yoga Pants",
        slug: "high-waisted-yoga-pants",
        description: "Stretchy, comfortable leggings suitable for active wear or lounging.",
        category: "activewear",
        price: 2800,
        images: ["https://example.com/images/yoga-pants.jpg"],
        variants: [
          { sku: "YOG-BLK-S", size: "S", color: "Black", stock: 25 },
          { sku: "YOG-BLK-M", size: "M", color: "Black", stock: 30 }
        ]
      },
      {
        name: "Cozy Knit Sweater",
        slug: "cozy-knit-sweater",
        description: "Warm and soft chunky knit sweater for the winter season.",
        category: "outerwear",
        price: 5500,
        images: ["https://example.com/images/knit-sweater.jpg"],
        variants: [
          { sku: "KNT-CRM-M", size: "M", color: "Cream", stock: 10 },
          { sku: "KNT-CRM-L", size: "L", color: "Cream", stock: 12 },
          { sku: "KNT-GRY-M", size: "M", color: "Grey", stock: 8 }
        ]
      },
      {
        name: "Basic Crewneck Sweatshirt",
        slug: "basic-crewneck-sweatshirt",
        description: "Essential minimalist sweatshirt for daily comfort.",
        category: "outerwear",
        price: 3200,
        images: ["https://example.com/images/crewneck.jpg"],
        variants: [
          { sku: "CRW-NVY-M", size: "M", color: "Navy", stock: 18 },
          { sku: "CRW-NVY-L", size: "L", color: "Navy", stock: 22 },
          { sku: "CRW-GRY-L", size: "L", color: "Heather Grey", stock: 15 }
        ]
      },
      {
        name: "Linen Beach Shorts",
        slug: "linen-beach-shorts",
        description: "Breathable linen shorts perfect for a tropical getaway.",
        category: "shorts",
        price: 2000,
        images: ["https://example.com/images/linen-shorts.jpg"],
        variants: [
          { sku: "SHR-BGE-M", size: "M", color: "Beige", stock: 12 },
          { sku: "SHR-BGE-L", size: "L", color: "Beige", stock: 10 },
          { sku: "SHR-OLV-M", size: "M", color: "Olive", stock: 8 }
        ]
      },
      {
        name: "Leather Jacket",
        slug: "leather-jacket",
        description: "Premium faux leather jacket with metal hardware.",
        category: "outerwear",
        price: 8500,
        images: ["https://example.com/images/leather-jacket.jpg"],
        variants: [
          { sku: "JKT-BLK-M", size: "M", color: "Black", stock: 5 },
          { sku: "JKT-BLK-L", size: "L", color: "Black", stock: 3 }
        ]
      }
    ];

    await Promise.all(products.map(p => Product.create(p)));
    console.log(`Successfully seeded ${products.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
