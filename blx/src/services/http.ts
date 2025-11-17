import axios from "axios";

// Get API base URL from environment variable, fallback to default
// Check both NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_URL for compatibility
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

// Log baseURL removed to reduce console noise

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
http.interceptors.request.use(
  (config) => {
    // Đảm bảo config không undefined
    if (!config) {
      console.error("[API] Request config is undefined");
      return config || {};
    }

    // Nếu data là FormData, đảm bảo axios tự động set Content-Type với boundary
    if (config.data instanceof FormData) {
      // Xóa Content-Type header nếu có để axios tự động set multipart/form-data với boundary
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        // Đảm bảo không có bất kỳ header Content-Type nào
        Object.keys(config.headers).forEach(key => {
          if (key.toLowerCase() === 'content-type') {
            delete config.headers[key];
          }
        });
      }
      
      // FormData logging removed to reduce console noise
    }
    return config;
  },
  (error) => {
    console.error("[API] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Track if connection error has been logged to avoid spam
let connectionErrorLogged = false;

// Track 500 errors to avoid spam (log once per endpoint per minute)
const error500Logs: Map<string, number> = new Map();
const ERROR_LOG_COOLDOWN = 60000; // 1 minute

// Add response interceptor for error handling
http.interceptors.response.use(
  (response) => {
    // Reset connection error flag on successful request
    connectionErrorLogged = false;
    return response;
  },
  (error) => {
    // Đảm bảo error không undefined
    if (!error) {
      console.error("[API] Response error is undefined");
      return Promise.reject(new Error("Unknown error"));
    }

    // Check for connection errors
    const isConnectionError =
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ETIMEDOUT" ||
      error.message === "Network Error" ||
      error.message?.includes("fetch failed") ||
      error.message?.includes("ECONNREFUSED") ||
      (error.request && !error.response); // Request made but no response

    if (isConnectionError) {
      // Only log connection error once to avoid console spam
      if (!connectionErrorLogged) {
        console.error(
          `[API Error] Cannot connect to API server. Please ensure the backend is running on ${baseURL}`
        );
        connectionErrorLogged = true;
      }
      // Suppress the error details to reduce console noise
      error.suppressLog = true;
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const statusText = error.response.statusText;
      const data = error.response.data;

      // Extract error message from NestJS error format
      let errorMessage = "Unknown error";
      if (data) {
        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }

      // Only log non-401 errors (401 is common during auth, skip to reduce noise)
      if (status !== 401 && status >= 500) {
        // Get request URL and method for better debugging
        const requestUrl = error.config?.url || error.response?.config?.url || "unknown";
        const requestMethod = error.config?.method?.toUpperCase() || error.response?.config?.method?.toUpperCase() || "GET";
        const endpointKey = `${requestMethod} ${requestUrl}`;
        
        // Rate limiting: only log once per endpoint per minute
        const lastLogTime = error500Logs.get(endpointKey);
        const now = Date.now();
        
        if (!lastLogTime || (now - lastLogTime) > ERROR_LOG_COOLDOWN) {
          error500Logs.set(endpointKey, now);
          // Improved error message with hint that this is a backend issue
          console.error(
            `[API Error] ${status} ${statusText} - ${requestMethod} ${requestUrl}\n` +
            `  Message: ${errorMessage}\n` +
            `  Note: This is a backend server error. Please check backend logs for details.`
          );
        }
      }

      // Attach message to error for easier access
      if (!error.response.data?.message && errorMessage !== "Unknown error") {
        error.response.data = {
          ...(error.response.data || {}),
          message: errorMessage,
        };
      }
    } else if (error.request) {
      // Request made but no response - only log if not already logged
      if (!connectionErrorLogged) {
        console.error(
          `[API Error] No response received from ${baseURL}`
        );
        connectionErrorLogged = true;
      }
    }
    return Promise.reject(error);
  }
);

export default http;
