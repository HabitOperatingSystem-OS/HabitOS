import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 for auth-related endpoints or if explicitly needed
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config.url?.includes("/auth/");
      const isLoginPage = window.location.pathname === "/login";

      // Only auto-logout for non-auth endpoints and not on login page
      if (!isAuthEndpoint && !isLoginPage) {
        console.warn("Authentication failed, redirecting to login");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    // Log the error for debugging
    console.error("API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Dashboard API calls
export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// Habits API calls
export const habitsAPI = {
  getHabits: async () => {
    const response = await api.get("/habits");
    return response.data;
  },
  createHabit: async (habitData) => {
    const response = await api.post("/habits", habitData);
    return response.data;
  },
  updateHabit: async (id, habitData) => {
    const response = await api.put(`/habits/${id}`, habitData);
    return response.data;
  },
  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },
};

// Check-ins API calls
export const checkInsAPI = {
  getCheckIns: async () => {
    const response = await api.get("/check-ins");
    return response.data;
  },
  createCheckIn: async (checkInData) => {
    const response = await api.post("/check-ins", checkInData);
    return response.data;
  },
  updateCheckIn: async (id, checkInData) => {
    const response = await api.put(`/check-ins/${id}`, checkInData);
    return response.data;
  },
};

export default api;
