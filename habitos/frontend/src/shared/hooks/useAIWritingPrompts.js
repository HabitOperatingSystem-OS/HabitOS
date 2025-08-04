import { useState, useCallback, useRef } from "react";
import { aiService } from "../../services/aiService";

/**
 * Hook for generating AI writing prompts
 * Provides a focused interface for prompt generation
 */
export const useAIWritingPrompts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const lastRefreshTime = useRef(null);

  /**
   * Generate writing prompts
   * @param {Object} options - Options for prompt generation
   * @param {number} options.count - Number of prompts to generate (default: 5)
   * @param {boolean} options.forceRefresh - Force refresh even if recently generated
   * @returns {Promise<Array>} Array of generated prompts
   */
  const generatePrompts = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Add a small delay to ensure different prompts on rapid refreshes
      if (options.forceRefresh) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const response = await aiService.generatePrompts(options);
      const promptList = response.prompts || [];
      setPrompts(promptList);
      lastRefreshTime.current = Date.now();
      return promptList;
    } catch (err) {
      const errorMessage = err.message || "Failed to generate prompts";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh prompts (alias for generatePrompts with force refresh)
   */
  const refreshPrompts = useCallback(
    async (options = {}) => {
      return generatePrompts({ ...options, forceRefresh: true });
    },
    [generatePrompts]
  );

  /**
   * Clear the current prompts and error state
   */
  const clearPrompts = useCallback(() => {
    setPrompts([]);
    setError(null);
    lastRefreshTime.current = null;
  }, []);

  /**
   * Get time since last refresh
   */
  const getTimeSinceLastRefresh = useCallback(() => {
    if (!lastRefreshTime.current) return null;
    return Date.now() - lastRefreshTime.current;
  }, []);

  return {
    // State
    loading,
    error,
    prompts,
    lastRefreshTime: lastRefreshTime.current,

    // Actions
    generatePrompts,
    refreshPrompts,
    clearPrompts,
    getTimeSinceLastRefresh,
  };
};
