import React from 'react';
import ProductRow from './ProductRow';

const ProductTable = ({ products, suggestions, onSuggestionApplied, onRefresh }) => {
  return (
    <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Current Price</th>
            <th>Suggested Price</th>
            <th>Inventory</th>
            <th>Expected Revenue Change</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <ProductRow
              key={product._id}
              product={product}
              suggestion={suggestions[String(product._id)]}
              onSuggestionApplied={onSuggestionApplied}
              onRefresh={onRefresh}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;

