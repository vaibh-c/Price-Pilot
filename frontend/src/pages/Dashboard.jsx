import React, { useState, useEffect } from 'react';
import ProductTable from '../components/ProductTable';
import UploadProductsModal from '../components/UploadProductsModal';
import RevenueSimulationPanel from '../components/RevenueSimulationPanel';
import { getProducts, optimizePrices } from '../api/apiClient';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [optimizationResults, setOptimizationResults] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (products.length === 0) {
      alert('Please upload products first');
      return;
    }

    try {
      setLoading(true);
      const productIds = products.map(p => p._id);
      const result = await optimizePrices({ productIds });

      console.log('Optimization result:', result); // Debug log

      if (!result || !result.results || result.results.length === 0) {
        alert('No optimization results returned. Please check the backend logs.');
        return;
      }

      // Map suggestions by productId (convert to string for proper matching)
      const suggestionsMap = {};
      result.results.forEach(item => {
        const productIdStr = String(item.productId);
        // Ensure all values are valid numbers
        suggestionsMap[productIdStr] = {
          suggestionId: item.suggestionId,
          suggested_price: item.suggested_price != null ? Number(item.suggested_price) : null,
          expected_revenue_change: item.expected_revenue_change != null ? Number(item.expected_revenue_change) : 0,
          expected_margin_change: item.expected_margin_change != null ? Number(item.expected_margin_change) : 0,
          reason: item.reason || 'No reason provided'
        };
      });

      console.log('Suggestions map:', suggestionsMap); // Debug log
      console.log('Products:', products.map(p => ({ id: String(p._id), name: p.name }))); // Debug log

      setSuggestions(suggestionsMap);
      setOptimizationResults(result);
      setSelectedProducts(productIds);
    } catch (error) {
      console.error('Error optimizing prices:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to optimize prices: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionApplied = (productId) => {
    // Reload products to get updated prices
    loadProducts();
    
    // Remove suggestion from state (convert to string for proper matching)
    const newSuggestions = { ...suggestions };
    delete newSuggestions[String(productId)];
    setSuggestions(newSuggestions);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadProducts();
  };

  const calculateTotalRevenue = () => {
    if (!optimizationResults) return null;

    let currentRevenue = 0;
    let suggestedRevenue = 0;

    optimizationResults.results.forEach(item => {
      const product = products.find(p => String(p._id) === String(item.productId));
      if (product) {
        // Estimate current revenue (simplified: assume average units sold)
        const avgUnits = product.sales_history?.length > 0
          ? product.sales_history.reduce((sum, s) => sum + s.units_sold, 0) / product.sales_history.length
          : 10;
        
        currentRevenue += product.current_price * avgUnits;
        suggestedRevenue += item.suggested_price * avgUnits * (1 + (item.expected_revenue_change / 100));
      }
    });

    return {
      current: currentRevenue,
      suggested: suggestedRevenue,
      change: suggestedRevenue - currentRevenue,
      changePercent: ((suggestedRevenue - currentRevenue) / currentRevenue) * 100
    };
  };

  const revenueData = calculateTotalRevenue();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>PricePilot</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Products
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleOptimize}
            disabled={loading || products.length === 0}
          >
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </header>

      {revenueData && (
        <RevenueSimulationPanel 
          currentRevenue={revenueData.current}
          suggestedRevenue={revenueData.suggested}
          change={revenueData.change}
          changePercent={revenueData.changePercent}
        />
      )}

      <div className="dashboard-content">
        {loading && products.length === 0 ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Upload products to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              Upload Products
            </button>
          </div>
        ) : (
          <ProductTable
            products={products}
            suggestions={suggestions}
            onSuggestionApplied={handleSuggestionApplied}
            onRefresh={loadProducts}
          />
        )}
      </div>

      {showUploadModal && (
        <UploadProductsModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;

