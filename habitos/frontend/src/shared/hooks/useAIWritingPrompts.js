import { useState, useCallback } from "react";
import { aiService } from "../../services/aiService";

/**
 * Hook for generating AI writing prompts
 * Provides a focused interface for prompt generation
 */
export const useAIWritingPrompts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);

  /**
   * Generate writing prompts
   * @param {Object} options - Options for prompt generation
   * @param {number} options.count - Number of prompts to generate (default: 5)
   * @returns {Promise<Array>} Array of generated prompts
   */
  const generatePrompts = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await aiService.generatePrompts(options);
      const promptList = response.prompts || [];
      setPrompts(promptList);
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
   * Refresh prompts (alias for generatePrompts)
   */
  const refreshPrompts = useCallback(
    async (options = {}) => {
      return generatePrompts(options);
    },
    [generatePrompts]
  );

  /**
   * Clear the current prompts and error state
   */
  const clearPrompts = useCallback(() => {
    setPrompts([]);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    prompts,

    // Actions
    generatePrompts,
    refreshPrompts,
    clearPrompts,
  };
};
