import axios from "axios";

// const BASE_URL = "https://nutro-backend.onrender.com" ;
const BASE_URL = "https://api.thegpdn.org/api";
// const BASE_URL = "https://gpdn-global-palliative-doctors-network.onrender.com/api";

const Api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor for debugging
Api.interceptors.request.use(
  (config) => {
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor to handle response errors
Api.interceptors.response.use(
  (response) => {
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor to add Authorization header with token if available
Api.interceptors.request.use(
  (config) => {
    // Access localStorage only in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      // Add token to the request headers if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);


export default Api;
