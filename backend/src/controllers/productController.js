import Product from '../models/Product.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

/**
 * Upload products via CSV or JSON
 */
export const uploadProducts = async (req, res) => {
  try {
    let products = [];

    console.log('Upload Request Body:', req.body);
    console.log('Upload Request File:', req.file ? 'File present' : 'No file');

    if (req.file) {
      // CSV upload
      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      products = results.map(row => ({
        name: row.name || row.Name || '',
        sku: row.sku || row.SKU || row.Sku || '',
        category: row.category || row.Category || '',
        cost: parseFloat(row.cost || row.Cost || 0),
        current_price: parseFloat(row.current_price || row.currentPrice || row.price || row.Price || 0),
        inventory: parseInt(row.inventory || row.Inventory || 0),
        sales_history: parseSalesHistory(row.sales_history || row.salesHistory || '[]')
      }));
    } else if (req.body.products && Array.isArray(req.body.products)) {
      // JSON upload
      products = req.body.products;
    } else if (req.body.name && req.body.sku) {
      // Single product
      products = [req.body];
    } else {
      return res.status(400).json({ message: 'Invalid request format. Provide CSV file or products array or single product object.' });
    }

    // Validate products
    const validatedProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const validationError = validateProduct(product);

      if (validationError) {
        errors.push({ index: i, product: product.name || product.sku, error: validationError });
      } else {
        validatedProducts.push({
          name: product.name.trim(),
          sku: product.sku.trim(),
          category: product.category.trim(),
          cost: parseFloat(product.cost),
          current_price: parseFloat(product.current_price),
          inventory: parseInt(product.inventory) || 0,
          sales_history: Array.isArray(product.sales_history) ? product.sales_history : []
        });
      }
    }

    if (validatedProducts.length === 0) {
      return res.status(400).json({ message: 'No valid products to upload', errors });
    }

    // Insert products (upsert by SKU)
    const insertedProducts = [];
    const updatedProducts = [];

    for (const product of validatedProducts) {
      const existing = await Product.findOne({ sku: product.sku });

      if (existing) {
        // Update existing product
        Object.assign(existing, product);
        await existing.save();
        updatedProducts.push(existing);
      } else {
        // Insert new product
        const newProduct = new Product(product);
        await newProduct.save();
        insertedProducts.push(newProduct);
      }
    }

    res.status(201).json({
      message: 'Products processed successfully',
      inserted: insertedProducts.length,
      updated: updatedProducts.length,
      errors: errors.length > 0 ? errors : undefined,
      products: [...insertedProducts, ...updatedProducts]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading products', error: error.message });
  }
};

/**
 * Get all products with optional filters
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search, limit = 100, skip = 0 } = req.query;

    const query = {};

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') }
      ];
    }

    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .select('-sales_history'); // Exclude sales_history for list view

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allowedUpdates = ['name', 'category', 'cost', 'current_price', 'inventory', 'sales_history'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Helper functions
const validateProduct = (product) => {
  if (!product.name || !product.name.trim()) {
    return 'Name is required';
  }
  if (!product.sku || !product.sku.trim()) {
    return 'SKU is required';
  }
  if (!product.category || !product.category.trim()) {
    return 'Category is required';
  }
  if (isNaN(product.cost) || parseFloat(product.cost) < 0) {
    return 'Valid cost is required';
  }
  if (isNaN(product.current_price) || parseFloat(product.current_price) < 0) {
    return 'Valid current_price is required';
  }
  if (product.inventory !== undefined && (isNaN(product.inventory) || parseInt(product.inventory) < 0)) {
    return 'Valid inventory is required';
  }
  return null;
};

const parseSalesHistory = (str) => {
  try {
    if (typeof str === 'string') {
      return JSON.parse(str);
    }
    return Array.isArray(str) ? str : [];
  } catch {
    return [];
  }
};

