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
   * @returns {Promise<Object>} The generated summary
   */
  const generateMonthlySummary = useCallback(async (month, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await aiService.generateMonthlySummary(month, options);

      // Extract the summary data from the response
      const summaryData = response.summary || response;
      setSummary(summaryData);
      return summaryData;
    } catch (err) {
      const errorMessage = err.message || "Failed to generate monthly summary";
      setError(errorMessage);
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
