import axios from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:5000",
});
// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract and format error messages
    const message =
      error.response?.data?.message || // Backend-provided message
      error.response?.data?.error ||  // Alternative message
      "An unexpected error occurred."; // Default fallback message

    return Promise.reject(new Error(message)); // Reject with a custom error
  }
);

export default api;