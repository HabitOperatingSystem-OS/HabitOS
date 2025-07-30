// AI Service for comprehensive journal analysis
export const aiService = {
  // Generate reflective prompts based on journal patterns
  generatePrompts: async (options = {}) => {
    try {
      const response = await fetch(
        `/api/ai/journal/prompts?count=${options.count || 5}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
        body: JSON.stringify({ month, ...options }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error generating monthly summary:", error);
      throw error;
    }
  },
};
