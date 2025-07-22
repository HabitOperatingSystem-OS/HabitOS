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
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Habits API calls
export const habitsAPI = {
  getHabits: async () => {
    const response = await api.get("/habits/");
    return response.data;
  },
  getHabit: async (id) => {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  },
  createHabit: async (habitData) => {
    const response = await api.post("/habits/", habitData);
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
    const response = await api.get("/check-ins/");
    return response.data;
  },
  getHabitCheckIns: async (habitId) => {
    const response = await api.get(`/check-ins/habit/${habitId}`);
    return response.data;
  },
  createCheckIn: async (checkInData) => {
    const response = await api.post("/check-ins/", checkInData);
    return response.data;
  },
  createBulkCheckIn: async (bulkCheckInData) => {
    console.log("Sending bulk check-in request:", bulkCheckInData);
    try {
      const response = await api.post("/check-ins/bulk", bulkCheckInData);
      console.log("Bulk check-in response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Bulk check-in error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },
  updateCheckIn: async (id, checkInData) => {
    const response = await api.put(`/check-ins/${id}`, checkInData);
    return response.data;
  },
};

// Journal API calls
export const journalAPI = {
  getJournalEntries: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);
    if (filters.sentiment) params.append("sentiment", filters.sentiment);
    if (filters.includeAiData) params.append("include_ai_data", "true");

    const response = await api.get(`/journal/?${params.toString()}`);
    return response.data;
  },

  getJournalEntry: async (id, includeAiData = false) => {
    const params = includeAiData ? "?include_ai_data=true" : "";
    const response = await api.get(`/journal/${id}${params}`);
    return response.data;
  },

  createJournalEntry: async (entryData) => {
    const response = await api.post("/journal/", entryData);
    return response.data;
  },

  updateJournalEntry: async (id, entryData) => {
    const response = await api.put(`/journal/${id}`, entryData);
    return response.data;
  },

  deleteJournalEntry: async (id) => {
    const response = await api.delete(`/journal/${id}`);
    return response.data;
  },

  getSentiments: async () => {
    const response = await api.get("/journal/sentiments");
    return response.data;
  },

  analyzeSentiment: async (content) => {
    const response = await api.post("/journal/sentiment-analysis", { content });
    return response.data;
  },
};

export default api;
