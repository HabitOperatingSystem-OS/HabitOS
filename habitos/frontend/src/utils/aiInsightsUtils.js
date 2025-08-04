/**
 * Utility functions for handling AI insights
 */

/**
 * Safely parse AI insights from JSON string
 * @param {string} aiInsights - JSON string or plain text
 * @returns {object|null} Parsed insights object or null if invalid
 */
export const parseAIInsights = (aiInsights) => {
  if (!aiInsights || typeof aiInsights !== "string") {
    return null;
  }

  try {
    return JSON.parse(aiInsights);
  } catch (error) {
    // If it's not valid JSON, treat it as plain text
    return {
      insight: aiInsights,
      summary: aiInsights,
      emotion: "neutral",
      themes: [],
      recommendations: [],
    };
  }
};

/**
 * Get a searchable text from AI insights
 * @param {string} aiInsights - JSON string or plain text
 * @returns {string} Searchable text
 */
export const getSearchableAIInsights = (aiInsights) => {
  if (!aiInsights || typeof aiInsights !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(aiInsights);
    // Combine all text fields for searching
    const searchableParts = [
      parsed.insight,
      parsed.summary,
      parsed.emotion,
      parsed.themes?.join(" "),
      parsed.recommendations?.join(" "),
    ].filter(Boolean);

    return searchableParts.join(" ").toLowerCase();
  } catch (error) {
    // If it's not valid JSON, return the original string
    return aiInsights.toLowerCase();
  }
};

/**
 * Format AI insights for display
 * @param {string} aiInsights - JSON string or plain text
 * @returns {object} Formatted insights object
 */
export const formatAIInsights = (aiInsights) => {
  const parsed = parseAIInsights(aiInsights);

  if (!parsed) {
    return {
      insight: "",
      summary: "",
      emotion: "neutral",
      themes: [],
      recommendations: [],
      hasData: false,
    };
  }

  return {
    insight: parsed.insight || parsed.summary || "",
    summary: parsed.summary || parsed.insight || "",
    emotion: parsed.emotion || "neutral",
    themes: Array.isArray(parsed.themes) ? parsed.themes : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
    hasData: true,
  };
};
