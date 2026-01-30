import Suggestion from '../models/Suggestion.js';
import Product from '../models/Product.js';

/**
 * Get all suggestions with optional filters
 */
export const getSuggestions = async (req, res) => {
  try {
    const { productId, applied, limit = 100, skip = 0 } = req.query;
    
    const query = {};
    
    if (productId) {
      query.productId = productId;
    }
    
    if (applied !== undefined) {
      query.applied = applied === 'true';
    }

    const suggestions = await Suggestion.find(query)
      .populate('productId', 'name sku category')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Suggestion.countDocuments(query);

    res.json({
      suggestions,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
};

/**
 * Apply a suggestion to a product
 */
export const applySuggestion = async (req, res) => {
  try {
    const { productId, suggestionId } = req.body;

    if (!productId || !suggestionId) {
      return res.status(400).json({ message: 'productId and suggestionId are required' });
    }

    // Find the suggestion
    const suggestion = await Suggestion.findById(suggestionId);
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (suggestion.applied) {
      return res.status(400).json({ message: 'Suggestion already applied' });
    }

    if (suggestion.productId.toString() !== productId) {
      return res.status(400).json({ message: 'Suggestion does not match product' });
    }

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product price
    product.current_price = suggestion.suggested_price;
    await product.save();

    // Mark suggestion as applied
    suggestion.applied = true;
    await suggestion.save();

    res.json({
      message: 'Suggestion applied successfully',
      product,
      suggestion
    });
  } catch (error) {
    console.error('Apply suggestion error:', error);
    res.status(500).json({ message: 'Error applying suggestion', error: error.message });
  }
};

/**
 * Get suggestion by ID
 */
export const getSuggestionById = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id)
      .populate('productId');
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json(suggestion);
  } catch (error) {
    console.error('Get suggestion error:', error);
    res.status(500).json({ message: 'Error fetching suggestion', error: error.message });
  }
};

