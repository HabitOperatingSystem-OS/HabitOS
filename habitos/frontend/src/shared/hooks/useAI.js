import { useState, useCallback } from "react";
import { aiService } from "../../services/aiService";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [moodTrends, setMoodTrends] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [emotionalPatterns, setEmotionalPatterns] = useState(null);
  const [insightsSummary, setInsightsSummary] = useState(null);
  const [habitCorrelations, setHabitCorrelations] = useState(null);
  const [entriesWithInsights, setEntriesWithInsights] = useState([]);

  // Generate reflective prompts
  const generatePrompts = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.generatePrompts(options);
      setPrompts(response.prompts || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to generate prompts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze patterns across journal entries
  const analyzePatterns = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzePatterns(filters);
      setPatterns(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to analyze patterns");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze sentiment with enhanced insights
  const analyzeSentiment = useCallback(async (content, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzeSentiment(content, options);
      return response;
    } catch (err) {
      setError(err.message || "Failed to analyze sentiment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get AI recommendations
  const getRecommendations = useCallback(async (userId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.getRecommendations(userId, options);
      setRecommendations(response.recommendations || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to get recommendations");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze mood trends
  const analyzeMoodTrends = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzeMoodTrends(filters);
      setMoodTrends(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to analyze mood trends");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get writing suggestions
  const getWritingSuggestions = useCallback(
    async (entryContent, options = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await aiService.getWritingSuggestions(
          entryContent,
          options
        );
        return response;
      } catch (err) {
        setError(err.message || "Failed to get writing suggestions");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Analyze emotional patterns
  const analyzeEmotionalPatterns = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzeEmotionalPatterns(filters);
      setEmotionalPatterns(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to analyze emotional patterns");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate insights summary
  const generateInsightsSummary = useCallback(
    async (period = "week", options = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await aiService.generateInsightsSummary(
          period,
          options
        );
        setInsightsSummary(response);
        return response;
      } catch (err) {
        setError(err.message || "Failed to generate insights summary");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Analyze habit-journal correlations
  const analyzeHabitJournalCorrelations = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzeHabitJournalCorrelations(options);
      setHabitCorrelations(response);
      return response;
    } catch (err) {
      setError(err.message || "Failed to analyze habit-journal correlations");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get entries with insights
  const getEntriesWithInsights = useCallback(async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.getEntriesWithInsights(limit, offset);
      setEntriesWithInsights(response.entries || []);
      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch entries with insights");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear all AI data
  const clearAIData = useCallback(() => {
    setInsights(null);
    setPrompts([]);
    setPatterns(null);
    setMoodTrends(null);
    setRecommendations([]);
    setEmotionalPatterns(null);
    setInsightsSummary(null);
    setHabitCorrelations(null);
    setEntriesWithInsights([]);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    insights,
    prompts,
    patterns,
    moodTrends,
    recommendations,
    emotionalPatterns,
    insightsSummary,
    habitCorrelations,
    entriesWithInsights,

    // Actions
    generatePrompts,
    analyzePatterns,
    analyzeSentiment,
    getRecommendations,
    analyzeMoodTrends,
    getWritingSuggestions,
    analyzeEmotionalPatterns,
    generateInsightsSummary,
    analyzeHabitJournalCorrelations,
    getEntriesWithInsights,
    clearAIData,
  };
};
