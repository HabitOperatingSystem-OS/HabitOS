import { useState, useCallback } from "react";
import { aiService } from "../../services/aiService";

/**
 * Hook for generating monthly AI summaries
 * Provides a focused interface for monthly journal analysis
 */
export const useAIMonthlySummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  /**
   * Generate monthly AI summary
   * @param {string} month - Month in YYYY-MM format (e.g., "2025-07")
   * @param {Object} options - Additional options for summary generation
   * @param {boolean} options.forceRefresh - Force refresh even if cached
   * @returns {Promise<Object>} The generated summary
   */
  const generateMonthlySummary = useCallback(async (month, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "DEBUG: Generating monthly summary for month:",
        month,
        "options:",
        options
      );

      const response = await aiService.generateMonthlySummary(month, options);

      console.log("DEBUG: Raw response from API:", response);

      // Check if the response has an error
      if (response.error) {
        console.error("DEBUG: API returned error:", response.error);
        throw new Error(response.error);
      }

      // Extract the summary data from the response
      const summaryData = response.summary || response;
      console.log("DEBUG: Extracted summary data:", summaryData);
      console.log("DEBUG: Is fallback?", summaryData.is_fallback);

      setSummary(summaryData);
      return summaryData;
    } catch (err) {
      // Extract only the error message to avoid circular reference issues
      let errorMessage = "Failed to generate monthly summary";

      if (err && typeof err === "object") {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error("Monthly summary generation error:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear the current summary and error state
   */
  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    summary,

    // Actions
    generateMonthlySummary,
    clearSummary,
  };
};
