import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for graceful error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

// Scheme API calls
export const getGlobalStats = async () => {
  try {
    const res = await apiClient.get('/schemes/meta/stats');
    return res.data;
  } catch (err) {
    // Fallback default statistics if backend is momentarily unreachable
    return {
      total_schemes: 4693,
      central_schemes: 684,
      state_schemes: 4009,
      categories_count: 25,
      states_count: 37,
      women_schemes_count: 448,
      bpl_schemes_count: 157,
      disability_schemes_count: 308,
    };
  }
};

export const getCategories = async () => {
  const res = await apiClient.get('/schemes/meta/categories');
  return res.data;
};

export const getStates = async () => {
  const res = await apiClient.get('/schemes/meta/states');
  return res.data;
};

export const getSchemes = async (params = {}) => {
  const res = await apiClient.get('/schemes', { params });
  return res.data;
};

export const getSchemeBySlug = async (slug) => {
  const res = await apiClient.get(`/schemes/${slug}`);
  return res.data;
};

// Eligibility API calls
export const matchEligibility = async (profileInput) => {
  const res = await apiClient.post('/eligibility/match', profileInput);
  return res.data;
};

export const quickCheckEligibility = async (profileInput) => {
  const res = await apiClient.post('/eligibility/quick-check', profileInput);
  return res.data;
};

// Chat & Conversational RAG API calls
export const sendChatMessage = async (message, history = [], currentProfile = null) => {
  const res = await apiClient.post('/chat/message', {
    message,
    history,
    current_profile: currentProfile,
  });
  return res.data;
};

export const extractDemographicSlots = async (text) => {
  const res = await apiClient.post('/chat/extract-slots', { text });
  return res.data;
};

// OCR Scanning API calls
export const scanDocumentFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/ocr/scan-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const scanCameraFrame = async (imageBase64) => {
  const res = await apiClient.post('/ocr/scan-frame', { image_base64: imageBase64 });
  return res.data;
};
