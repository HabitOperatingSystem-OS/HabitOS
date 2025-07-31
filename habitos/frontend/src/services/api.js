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
  getHabitStats: async () => {
    const response = await api.get("/habits/stats");
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

  analyzeSentiment: async (content, options = {}) => {
    const response = await api.post("/journal/sentiment-analysis", {
      content,
      ...options,
    });
    return response.data;
  },

  getEntriesWithInsights: async (limit = 50, offset = 0) => {
    const response = await api.get(
      `/journal/entries-with-insights?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  generatePrompts: async (options = {}) => {
    const response = await api.post("/ai/journal/prompts", options);
    return response.data;
  },

  analyzePatterns: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    const response = await api.get(`/journal/patterns?${params.toString()}`);
    return response.data;
  },

  getRecommendations: async (userId, options = {}) => {
    const response = await api.post(
      `/users/${userId}/journal-recommendations`,
      options
    );
    return response.data;
  },

  analyzeMoodTrends: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    const response = await api.get(`/journal/mood-trends?${params.toString()}`);
    return response.data;
  },

  getWritingSuggestions: async (entryContent, options = {}) => {
    const response = await api.post("/journal/writing-suggestions", {
      content: entryContent,
      ...options,
    });
    return response.data;
  },

  analyzeEmotionalPatterns: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    const response = await api.get(
      `/journal/emotional-patterns?${params.toString()}`
    );
    return response.data;
  },

  generateInsightsSummary: async (period = "week", options = {}) => {
    const response = await api.post("/ai/journal/monthly-summary", {
      month: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
      ...options,
    });
    return response.data;
  },

  analyzeHabitJournalCorrelations: async (options = {}) => {
    const response = await api.post("/journal/habit-correlations", options);
    return response.data;
  },
};

// Users API calls
export const usersAPI = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch(`/users/profile`, profileData);
    return response.data;
  },

  getUserStats: async (days = 30) => {
    const response = await api.get(`/users/stats?days=${days}`);
    return response.data;
  },

  getDashboardData: async () => {
    const response = await api.get(`/users/dashboard`);
    return response.data;
  },

  exportUserData: async () => {
    const response = await api.get(`/users/data-export`);
    return response.data;
  },
};

// Goals API calls
export const goalsAPI = {
  getGoals: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.habit_id) params.append("habit_id", filters.habit_id);
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);

    const response = await api.get(`/goals/?${params.toString()}`);
    return response.data;
  },

  getGoal: async (id) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  createGoal: async (goalData) => {
    const response = await api.post("/goals/", goalData);
    return response.data;
  },

  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  patchGoal: async (id, goalData) => {
    const response = await api.patch(`/goals/${id}`, goalData);
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  updateGoalProgress: async (id, progressData) => {
    const response = await api.put(`/goals/${id}/progress`, progressData);
    return response.data;
  },

  getHabitGoals: async (habitId) => {
    const response = await api.get(`/goals/habit/${habitId}`);
    return response.data;
  },

  getActiveGoals: async () => {
    const response = await api.get("/goals/active");
    return response.data;
  },

  getOverdueGoals: async () => {
    const response = await api.get("/goals/overdue");
    return response.data;
  },

  getGoalTypes: async () => {
    const response = await api.get("/goals/types");
    return response.data;
  },

  getGoalStatuses: async () => {
    const response = await api.get("/goals/statuses");
    return response.data;
  },

  getGoalPriorities: async () => {
    const response = await api.get("/goals/priorities");
    return response.data;
  },

  checkHabitGoal: async (habitId) => {
    const response = await api.get(`/goals/habit/${habitId}/check`);
    return response.data;
  },
};

export default api;
