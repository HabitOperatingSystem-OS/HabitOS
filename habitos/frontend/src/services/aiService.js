// AI Service for comprehensive journal analysis
export const aiService = {
  // Generate reflective prompts based on journal patterns
  generatePrompts: async (options = {}) => {
    try {
      const params = new URLSearchParams({
        count: options.count || 5,
        ...(options.forceRefresh && { force_refresh: "true" }),
      });

      const response = await fetch(`/api/ai/journal/prompts?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error generating prompts:", error);
      throw error;
    }
  },

  // Generate monthly AI summary
  generateMonthlySummary: async (month, options = {}) => {
    try {
      const response = await fetch(`/api/ai/journal/monthly-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          month,
          force_refresh: options.forceRefresh || false,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error generating monthly summary:", error);
      throw error;
    }
  },
};
