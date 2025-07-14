    import axios from 'axios';

// Base URL from the Postman collection
export const BASE_URL = 'https://apis.allsoft.co/api/documentManagement';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API endpoints based on the Postman collection
export const API = {
  auth: {
    generateOTP: (mobileNumber) => api.post('/generateOTP', { mobile_number: mobileNumber }),
    validateOTP: (mobileNumber, otp) => api.post('/validateOTP', { mobile_number: mobileNumber, otp }),
  },
  documents: {
    upload: (formData) => api.post('/saveDocumentEntry', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    search: (searchParams) => api.post('/searchDocumentEntry', searchParams),
    getTags: (term) => api.post('/documentTags', { term }),
  },
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('API Error:', error.response.data);
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error:', error.request);
    return 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
    return error.message;
  }
};