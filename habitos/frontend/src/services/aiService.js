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

      // Check if response has content before trying to parse JSON
      const responseText = await response.text();

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("Invalid JSON response from server");
      }

      // Check if the response indicates an error
      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error generating monthly summary:", error);
      // Ensure we only throw serializable error information
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to generate monthly summary");
      }
    }
  },
};
