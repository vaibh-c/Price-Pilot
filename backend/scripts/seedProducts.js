import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

// Generate random sales history
const generateSalesHistory = (days = 30, basePrice, baseUnits) => {
  const history = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate some variation
    const priceVariation = 1 + (Math.random() - 0.5) * 0.1; // ±5% price variation
    const unitsVariation = 1 + (Math.random() - 0.5) * 0.3; // ±15% units variation
    
    history.push({
      date: date,
      units_sold: Math.max(1, Math.round(baseUnits * unitsVariation)),
      price: Math.round(basePrice * priceVariation * 100) / 100
    });
  }
  
  return history;
};

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Sample products
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        sku: 'WH-001',
        category: 'Electronics',
        cost: 25.00,
        current_price: 49.99,
        inventory: 15,
        sales_history: generateSalesHistory(30, 49.99, 8)
      },
      {
        name: 'Smart Watch Pro',
        sku: 'SW-002',
        category: 'Electronics',
        cost: 80.00,
        current_price: 149.99,
        inventory: 45,
        sales_history: generateSalesHistory(30, 149.99, 5)
      },
      {
        name: 'Running Shoes',
        sku: 'RS-003',
        category: 'Footwear',
        cost: 30.00,
        current_price: 79.99,
        inventory: 8,
        sales_history: generateSalesHistory(30, 79.99, 12)
      },
      {
        name: 'Yoga Mat Premium',
        sku: 'YM-004',
        category: 'Fitness',
        cost: 12.00,
        current_price: 29.99,
        inventory: 120,
        sales_history: generateSalesHistory(30, 29.99, 3)
      },
      {
        name: 'Coffee Maker Deluxe',
        sku: 'CM-005',
        category: 'Home & Kitchen',
        cost: 45.00,
        current_price: 89.99,
        inventory: 22,
        sales_history: generateSalesHistory(30, 89.99, 6)
      },
      {
        name: 'Laptop Stand',
        sku: 'LS-006',
        category: 'Office',
        cost: 15.00,
        current_price: 34.99,
        inventory: 3,
        sales_history: generateSalesHistory(30, 34.99, 15)
      },
      {
        name: 'Water Bottle 32oz',
        sku: 'WB-007',
        category: 'Fitness',
        cost: 8.00,
        current_price: 19.99,
        inventory: 200,
        sales_history: generateSalesHistory(30, 19.99, 2)
      },
      {
        name: 'Phone Case iPhone 15',
        sku: 'PC-008',
        category: 'Accessories',
        cost: 5.00,
        current_price: 14.99,
        inventory: 35,
        sales_history: generateSalesHistory(30, 14.99, 20)
      }
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();

