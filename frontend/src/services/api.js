import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const analyzeFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/analyze', formData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.detail || 
                         error.message || 
                         'Failed to analyze file';
    throw new Error(errorMessage);
  }
};

export const trainModel = async (savedPath) => {
  const formData = new FormData();
  formData.append('saved_path', savedPath);
  
  try {
    const response = await api.post('/train', formData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.detail || 
                         error.message || 
                         'Failed to train model';
    throw new Error(errorMessage);
  }
};

export const predict = async (modelId, file) => {
  const formData = new FormData();
  formData.append('model_id', modelId);
  formData.append('data', file);
  
  try {
    const response = await api.post('/predict', formData);
    return response.data;
  } catch (error) {
    // Handle FastAPI error responses (can be in 'detail' or 'error' field)
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.detail || 
                         error.message || 
                         'Failed to make predictions';
    throw new Error(errorMessage);
  }
};

export const downloadExample = async () => {
  try {
    const response = await api.get('/example', {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to download example');
  }
};

export const getReport = async (path) => {
  try {
    const response = await api.get('/report', {
      params: { path },
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get report');
  }
};

export const getPredictionHistory = async (modelId) => {
  try {
    const response = await api.get(`/predictions/history/${modelId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get prediction history');
  }
};

export default api;

