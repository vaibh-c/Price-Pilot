import Product from '../models/Product.js';
import Suggestion from '../models/Suggestion.js';
import { optimizePrice } from '../services/pricingService.js';

/**
 * Optimize prices for one or more products
 */
export const optimizePrices = async (req, res) => {
  try {
    const { productIds, category, all } = req.body;

    let products;

    if (all) {
      // Optimize all products
      products = await Product.find({});
    } else if (category) {
      // Optimize products in a category
      products = await Product.find({ category: new RegExp(category, 'i') });
    } else if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      // Optimize specific products
      products = await Product.find({ _id: { $in: productIds } });
    } else {
      return res.status(400).json({ 
        message: 'Provide productIds array, category, or set all: true' 
      });
    }

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    const results = [];
    const suggestions = [];

    for (const product of products) {
      // Calculate optimization
      const optimization = optimizePrice(product);

      // Create suggestion record
      const suggestion = new Suggestion({
        productId: product._id,
        previous_price: product.current_price,
        suggested_price: optimization.suggested_price,
        expected_revenue_change: optimization.expected_revenue_change,
        expected_margin_change: optimization.expected_margin_change,
        reason: optimization.reason,
        applied: false
      });

      await suggestion.save();

      results.push({
        productId: product._id.toString(), // Convert to string for frontend
        productName: product.name,
        sku: product.sku,
        current_price: product.current_price,
        ...optimization,
        suggestionId: suggestion._id.toString() // Convert to string for frontend
      });

      suggestions.push(suggestion);
    }

    res.json({
      message: `Optimized ${results.length} product(s)`,
      results,
      suggestions: suggestions.map(s => ({
        id: s._id.toString(),
        productId: s.productId.toString(),
        suggested_price: s.suggested_price,
        expected_revenue_change: s.expected_revenue_change,
        expected_margin_change: s.expected_margin_change,
        reason: s.reason
      }))
    });
  } catch (error) {
    console.error('Optimize prices error:', error);
    res.status(500).json({ message: 'Error optimizing prices', error: error.message });
  }
};

