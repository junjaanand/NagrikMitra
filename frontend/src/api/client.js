import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90s timeout to absorb Render container cold starts seamlessly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach official Supabase authentication token or dev demo
apiClient.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      // 1. Support local demo citizen switcher in development only
      const demoUser = localStorage.getItem('nagrikmitra_demo_user');
      if (demoUser && import.meta.env.DEV) {
        try {
          const parsed = JSON.parse(demoUser);
          const rbacRole = parsed?.user_metadata?.rbac_role || 
            (parsed?.user_metadata?.role?.toLowerCase().includes('vle') || parsed?.id?.includes('vle') ? 'admin' : 'citizen');
          token = `demo-session-${rbacRole}`;
        } catch {
          token = 'demo-session-token';
        }
      }

      // 2. Official Supabase Session Token (kills brittle localStorage loop)
      if (!token && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            token = session.access_token;
          }
        } catch (e) {
          console.warn('Failed to retrieve Supabase session:', e);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Storage access blocked or unavailable
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with silent 401 token refresh & retry + transient error recovery
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Silent 401 Auto-Refresh: Session expired after 1 hr, refresh token and retry seamlessly
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && supabase) {
      originalRequest._retry = true;
      try {
        const { data: { session }, error: refreshErr } = await supabase.auth.refreshSession();
        if (session?.access_token && !refreshErr) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (err) {
        console.warn('Session silent refresh failed:', err);
      }
    }

    // 2. Retry up to 3 times for transient 502/503/504 or network/timeout dropouts during Render cold start
    const isNetworkOrTimeout = !error.response && (error.code === 'ECONNABORTED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK');
    const isTransientStatus = error.response && [502, 503, 504].includes(error.response.status);

    if (originalRequest && (isNetworkOrTimeout || isTransientStatus)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= 3) {
        const delay = originalRequest._retryCount * 1500;
        console.warn(`Render server waking up. Retrying request (${originalRequest._retryCount}/3) in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return apiClient(originalRequest);
      }
    }

    const errorMsg = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    const err = new Error(errorMsg);
    err.response = error.response;
    return Promise.reject(err);
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

export const getAnalyticsData = async () => {
  try {
    const res = await apiClient.get('/schemes/meta/analytics');
    return res.data;
  } catch (err) {
    return {
      total_schemes: 4693,
      category_distribution: [
        { name: 'Education & Learning', count: 727, percentage: 15.5, color: '#2563eb' },
        { name: 'Social welfare & Empowerment', count: 686, percentage: 14.6, color: '#9333ea' },
        { name: 'Agriculture,Rural & Environment', count: 667, percentage: 14.2, color: '#16a34a' },
        { name: 'Business & Entrepreneurship', count: 417, percentage: 8.9, color: '#475569' },
        { name: 'Sports & Culture', count: 154, percentage: 3.3, color: '#0d9488' },
        { name: 'Skills & Employment', count: 127, percentage: 2.7, color: '#0284c7' },
        { name: 'Health & Wellness', count: 124, percentage: 2.6, color: '#e11d48' },
        { name: 'Banking,Financial Services and Insurance', count: 72, percentage: 1.5, color: '#6366f1' },
        { name: 'Other Specialized Sectors', count: 1719, percentage: 36.6, color: '#64748b' },
      ],
      jurisdiction_distribution: [
        { name: 'Central', count: 684, fill: '#2563eb' },
        { name: 'Gujarat', count: 636, fill: '#10b981' },
        { name: 'Uttarakhand', count: 440, fill: '#10b981' },
        { name: 'Madhya Pradesh', count: 283, fill: '#10b981' },
        { name: 'Goa', count: 269, fill: '#10b981' },
        { name: 'Puducherry', count: 267, fill: '#10b981' },
        { name: 'Haryana', count: 246, fill: '#10b981' },
        { name: 'Tamil Nadu', count: 232, fill: '#10b981' },
        { name: 'Rajasthan', count: 156, fill: '#10b981' },
        { name: 'Bihar', count: 112, fill: '#10b981' },
      ],
      benefit_types: [
        { type: 'Direct Benefit Transfer (DBT Cash)', count: 1308, percentage: 27.9, description: 'Direct financial deposits, pensions, and income support transfers.' },
        { type: 'Subsidized Credit & Micro-Loans', count: 1023, percentage: 21.8, description: 'Capital loans, interest subvention, and collateral-free credit.' },
        { type: 'Healthcare & Social Insurance', count: 921, percentage: 19.6, description: 'Cashless hospitalization, accidental coverage, and maternal aid.' },
        { type: 'Scholarships & Educational Grants', count: 560, percentage: 11.9, description: 'School/college tuition waivers, stipends, and research fellowships.' },
        { type: 'In-Kind Equipment & Housing', count: 509, percentage: 10.8, description: 'PMAY pucca houses, agricultural kits, toolkits, and solar pumps.' },
      ],
      financial_brackets: [
        { bracket: '< ₹10,000', count: 1553, label: 'Micro-grants & Exam Fees' },
        { bracket: '₹10k - ₹50k', count: 926, label: 'Annual Farmer & Wage DBT' },
        { bracket: '₹50k - ₹1.5 Lakh', count: 363, label: 'Housing & Livelihood Grants' },
        { bracket: '₹1.5L - ₹5 Lakh', count: 322, label: 'Tertiary Healthcare & Overseas Education' },
        { bracket: '> ₹5 Lakh', count: 372, label: 'Enterprise & Institutional Capital' },
      ],
      target_demographics: {
        women_targeted: 448,
        bpl_targeted: 157,
        pwd_targeted: 308,
        central_flagship: 684,
        state_initiatives: 4009,
      },
      estimated_total_subsidy_pool: '₹4,28,000 Crore+',
    };
  }
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
export const scanDocumentFile = async (file, consentAcknowledged = true) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`/ocr/scan-file?consent_acknowledged=${consentAcknowledged}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const scanCameraFrame = async (imageBase64, consentAcknowledged = true) => {
  const res = await apiClient.post('/ocr/scan-frame', {
    image_base64: imageBase64,
    consent_acknowledged: consentAcknowledged
  });
  return res.data;
};

// Day 11: Dynamic Scheme Ingestion & OGD Sync API calls
export const createScheme = async (schemeData) => {
  const res = await apiClient.post('/schemes/create', schemeData);
  return res.data;
};

export const syncOgdData = async () => {
  const res = await apiClient.post('/schemes/sync-ogd');
  return res.data;
};

// Day 13: Self-Healing Link Resolver & Mode Classification API calls
export const resolveSchemeLink = async (slug) => {
  const res = await apiClient.post(`/schemes/${slug}/resolve-link`);
  return res.data;
};

export const reportBrokenLink = async (slug, reason = 'Link appears broken or unreachable') => {
  const res = await apiClient.post(`/schemes/${slug}/report-link`, { reason });
  return res.data;
};

export const getSchemeModes = async () => {
  const res = await apiClient.get('/schemes/meta/modes');
  return res.data;
};


