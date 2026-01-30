import React, { useState } from 'react';
import { uploadProducts } from '../api/apiClient';

const UploadProductsModal = ({ onClose, onSuccess }) => {
  const [uploadType, setUploadType] = useState('csv'); // 'csv' or 'manual'
  const [file, setFile] = useState(null);
  const [manualProducts, setManualProducts] = useState([{ name: '', sku: '', category: '', cost: '', current_price: '', inventory: '' }]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleManualProductChange = (index, field, value) => {
    const updated = [...manualProducts];
    updated[index][field] = value;
    setManualProducts(updated);
  };

  const addManualProduct = () => {
    setManualProducts([...manualProducts, { name: '', sku: '', category: '', cost: '', current_price: '', inventory: '' }]);
  };

  const removeManualProduct = (index) => {
    if (manualProducts.length > 1) {
      setManualProducts(manualProducts.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      if (uploadType === 'csv') {
        if (!file) {
          setError('Please select a CSV file');
          setUploading(false);
          return;
        }
        await uploadProducts(file, true);
      } else {
        // Manual entry
        const products = manualProducts
          .filter(p => p.name && p.sku && p.category && p.cost && p.current_price)
          .map(p => ({
            name: p.name.trim(),
            sku: p.sku.trim(),
            category: p.category.trim(),
            cost: parseFloat(p.cost),
            current_price: parseFloat(p.current_price),
            inventory: parseInt(p.inventory) || 0,
            sales_history: []
          }));

        if (products.length === 0) {
          setError('Please fill in at least one product');
          setUploading(false);
          return;
        }

        await uploadProducts({ products });
      }

      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Products</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="upload-type-selector">
            <button
              className={`tab ${uploadType === 'csv' ? 'active' : ''}`}
              onClick={() => setUploadType('csv')}
            >
              CSV Upload
            </button>
            <button
              className={`tab ${uploadType === 'manual' ? 'active' : ''}`}
              onClick={() => setUploadType('manual')}
            >
              Manual Entry
            </button>
          </div>

          {uploadType === 'csv' ? (
            <div className="csv-upload">
              <p>Upload a CSV file with columns: name, sku, category, cost, current_price, inventory</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
              />
              {file && <p className="file-name">Selected: {file.name}</p>}
            </div>
          ) : (
            <div className="manual-entry">
              <p>Add products manually:</p>
              {manualProducts.map((product, index) => (
                <div key={index} className="manual-product-form">
                  <h4>Product {index + 1}</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={product.name}
                      onChange={(e) => handleManualProductChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="SKU *"
                      value={product.sku}
                      onChange={(e) => handleManualProductChange(index, 'sku', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Category *"
                      value={product.category}
                      onChange={(e) => handleManualProductChange(index, 'category', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Cost *"
                      value={product.cost}
                      onChange={(e) => handleManualProductChange(index, 'cost', e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Current Price *"
                      value={product.current_price}
                      onChange={(e) => handleManualProductChange(index, 'current_price', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Inventory"
                      value={product.inventory}
                      onChange={(e) => handleManualProductChange(index, 'inventory', e.target.value)}
                    />
                  </div>
                  {manualProducts.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => removeManualProduct(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addManualProduct}
              >
                + Add Another Product
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadProductsModal;

