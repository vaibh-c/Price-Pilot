import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products API
export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const uploadProducts = async (data, isFile = false) => {
  if (isFile) {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } else {
    const response = await apiClient.post('/products/upload', data);
    return response.data;
  }
};

export const updateProduct = async (id, data) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// Optimization API
export const optimizePrices = async (data) => {
  const response = await apiClient.post('/optimize', data);
  return response.data;
};

// Suggestions API
export const getSuggestions = async (params = {}) => {
  const response = await apiClient.get('/suggestions', { params });
  return response.data;
};

export const applySuggestion = async (productId, suggestionId) => {
  const response = await apiClient.post('/suggestions/apply', {
    productId,
    suggestionId
  });
  return response.data;
};

export default apiClient;

