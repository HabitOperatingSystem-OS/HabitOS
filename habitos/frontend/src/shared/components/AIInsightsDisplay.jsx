import React from "react";
import PropTypes from "prop-types";
import { Brain, Lightbulb, Heart, TrendingUp, Sparkles } from "lucide-react";
import { formatAIInsights } from "../../utils/aiInsightsUtils";

const AIInsightsDisplay = ({ aiInsights, className = "" }) => {
  const insights = formatAIInsights(aiInsights);

  if (!insights.hasData) {
    return null;
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
      case "very_positive":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "negative":
      case "very_negative":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
      case "very_positive":
        return <Heart className="h-4 w-4" />;
      case "negative":
      case "very_negative":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Insight */}
      {insights.insight && (
        <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <h4 className="font-medium text-primary-900 dark:text-primary-100">
              AI Insight
            </h4>
          </div>
          <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed">
            {insights.insight}
          </p>
        </div>
      )}

      {/* Summary */}
      {insights.summary && insights.summary !== insights.insight && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Summary
            </h4>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {insights.summary}
          </p>
        </div>
      )}

      {/* Themes */}
      {insights.themes && insights.themes.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">
              Key Themes
            </h4>
          </div>
          <div className="space-y-2">
            {insights.themes.map((theme, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">
                  •
                </span>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {theme}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
              Recommendations
            </h4>
          </div>
          <div className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-1">
                  •
                </span>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotion/Sentiment */}
      {insights.emotion && insights.emotion !== "neutral" && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Emotional Tone
          </span>
          <div className="flex items-center space-x-2">
            {getSentimentIcon(insights.emotion)}
            <span
              className={`text-sm font-medium capitalize px-2 py-1 rounded-full ${getSentimentColor(
                insights.emotion
              )}`}
            >
              {insights.emotion.replace("_", " ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

AIInsightsDisplay.propTypes = {
  aiInsights: PropTypes.string,
  className: PropTypes.string,
};

export default AIInsightsDisplay;
