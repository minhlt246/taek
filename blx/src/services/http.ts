import axios from "axios";

// Get API base URL from environment variable, fallback to default
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// Log baseURL in development for debugging
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  console.log(`[API Config] Base URL: ${baseURL}`);
}

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
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if connection error has been logged to avoid spam
let connectionErrorLogged = false;

// Add response interceptor for error handling
http.interceptors.response.use(
  (response) => {
    // Reset connection error flag on successful request
    connectionErrorLogged = false;
    return response;
  },
  (error) => {
    if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
      // Only log connection error once to avoid console spam
      if (process.env.NODE_ENV === "development" && !connectionErrorLogged) {
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

      // Only log errors in development mode
      // For 401 errors, use console.warn instead of console.error (less verbose)
      if (process.env.NODE_ENV === "development") {
        if (status === 401) {
          // 401 errors are common during authentication, use warn instead
          console.warn(
            `[API Warning] ${status} ${statusText}: ${errorMessage}`
          );
        } else {
          console.error(
            `[API Error] ${status} ${statusText}:`,
            errorMessage,
            data || "No error details"
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
      // Request made but no response
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[API Error] No response received from ${baseURL}`,
          error.request
        );
      }
    }
    return Promise.reject(error);
  }
);

export default http;
