import mongoose from 'mongoose';

const salesHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  units_sold: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  current_price: {
    type: Number,
    required: true,
    min: 0
  },
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sales_history: {
    type: [salesHistorySchema],
    default: []
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

