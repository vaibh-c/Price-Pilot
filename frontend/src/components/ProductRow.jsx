import React, { useState } from 'react';
import { applySuggestion } from '../api/apiClient';
import SuggestionBadge from './SuggestionBadge';

const ProductRow = ({ product, suggestion, onSuggestionApplied, onRefresh }) => {
  const [applying, setApplying] = useState(false);

  const handleApplySuggestion = async () => {
    if (!suggestion) return;

    const suggestedPrice = suggestion.suggested_price != null ? Number(suggestion.suggested_price).toFixed(2) : 'N/A';
    if (!window.confirm(`Apply suggested price of $${suggestedPrice} to ${product.name}?`)) {
      return;
    }

    try {
      setApplying(true);
      await applySuggestion(product._id, suggestion.suggestionId);
      onSuggestionApplied(product._id);
      onRefresh();
    } catch (error) {
      console.error('Error applying suggestion:', error);
      alert('Failed to apply suggestion: ' + (error.response?.data?.message || error.message));
    } finally {
      setApplying(false);
    }
  };

  return (
    <tr className={suggestion ? 'has-suggestion' : ''}>
      <td>{product.name}</td>
      <td>{product.sku}</td>
      <td>{product.category}</td>
      <td>${product.cost.toFixed(2)}</td>
      <td>${product.current_price.toFixed(2)}</td>
      <td>
        {suggestion && suggestion.suggested_price != null ? (
          <span className="suggested-price">
            ${Number(suggestion.suggested_price).toFixed(2)}
          </span>
        ) : (
          <span className="no-suggestion">-</span>
        )}
      </td>
      <td>
        <span className={`inventory ${product.inventory < 10 ? 'low' : product.inventory > 50 ? 'high' : ''}`}>
          {product.inventory}
        </span>
      </td>
      <td>
        {suggestion && suggestion.expected_revenue_change != null ? (
          <SuggestionBadge
            value={suggestion.expected_revenue_change}
            type="revenue"
          />
        ) : suggestion ? (
          <span className="no-suggestion">-</span>
        ) : null}
      </td>
      <td className="reason-cell">
        {suggestion && suggestion.reason ? (
          <span className="reason" title={suggestion.reason}>
            {suggestion.reason}
          </span>
        ) : (
          <span className="no-suggestion">-</span>
        )}
      </td>
      <td>
        {suggestion && !suggestion.applied && (
          <button
            className="btn btn-small btn-apply"
            onClick={handleApplySuggestion}
            disabled={applying}
          >
            {applying ? 'Applying...' : 'Apply'}
          </button>
        )}
        {suggestion?.applied && (
          <span className="applied-badge">Applied</span>
        )}
      </td>
    </tr>
  );
};

export default ProductRow;

