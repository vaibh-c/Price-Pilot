import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  previous_price: {
    type: Number,
    required: true,
    min: 0
  },
  suggested_price: {
    type: Number,
    required: true,
    min: 0
  },
  expected_revenue_change: {
    type: Number,
    required: true
  },
  expected_margin_change: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  applied: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
suggestionSchema.index({ productId: 1 });
suggestionSchema.index({ applied: 1 });
suggestionSchema.index({ createdAt: -1 });

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

export default Suggestion;

