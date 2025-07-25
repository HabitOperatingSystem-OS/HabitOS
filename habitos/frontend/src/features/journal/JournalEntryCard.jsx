import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { DeleteButton, Tag } from "../../shared/components";

const JournalEntryCard = ({ entry, onEdit, onDelete, showAiData = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);

  const getMoodEmoji = (rating) => {
    if (rating >= 9) return "😍";
    if (rating >= 8) return "😊";
    if (rating >= 7) return "🙂";
    if (rating >= 6) return "😐";
    if (rating >= 5) return "😕";
    if (rating >= 4) return "😟";
    if (rating >= 3) return "😔";
    if (rating >= 2) return "😢";
    return "😭";
  };

  const getMoodColor = (rating) => {
    if (rating >= 8) return "text-green-600 dark:text-green-400";
    if (rating >= 6) return "text-yellow-600 dark:text-yellow-400";
    if (rating >= 4) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getSentimentVariant = (sentiment) => {
    switch (sentiment) {
      case "very_positive":
        return "sentiment.very_positive";
      case "positive":
        return "sentiment.positive";
      case "neutral":
        return "sentiment.neutral";
      case "negative":
        return "sentiment.negative";
      case "very_negative":
        return "sentiment.very_negative";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    // Parse as local date, not UTC
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate if content needs truncation (more than 3 lines at ~80 chars per line)
  const maxChars = 150; // Reduced for more obvious testing
  const shouldTruncate = entry.content.length > maxChars;

  const truncateText = (text, maxLength = maxChars) => {
    if (text.length <= maxLength) return text;
    // Find the last space before the limit to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > maxLength * 0.8
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  };

  const displayText = isExpanded ? entry.content : truncateText(entry.content);

  return (
    <div className="card-premium p-6 hover:shadow-premium transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`text-2xl ${getMoodColor(entry.mood_rating)}`}>
            {typeof entry.mood_rating === "number" && !isNaN(entry.mood_rating)
              ? getMoodEmoji(entry.mood_rating)
              : "—"}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {formatDate(entry.entry_date)}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mood:{" "}
                {typeof entry.mood_rating === "number" &&
                !isNaN(entry.mood_rating)
                  ? `${entry.mood_rating}/10`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {entry.sentiment && (
            <Tag variant={getSentimentVariant(entry.sentiment)} size="sm">
              {entry.sentiment
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Tag>
          )}

          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
            aria-label="Edit entry"
          >
            <Edit className="w-4 h-4" />
          </button>

          <DeleteButton
            onClick={() => onDelete(entry.id)}
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Delete entry"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {!isExpanded && shouldTruncate ? (
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: "1.6",
              maxHeight: "4.8rem", // 3 lines * 1.6 line-height
            }}
          >
            {displayText}
          </div>
        ) : (
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {displayText}
          </div>
        )}

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Read More</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* AI Summary - Only show when expanded or if content is short */}
      {showAiData && entry.ai_summary && (isExpanded || !shouldTruncate) && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              AI Reflection
            </span>
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
            >
              {showAiSummary ? "Hide" : "Show"}
            </button>
          </div>

          {showAiSummary && (
            <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
              {entry.ai_summary}
            </p>
          )}
        </div>
      )}

      {/* AI Insights - Only show when expanded or if content is short */}
      {showAiData &&
        entry.ai_insights &&
        showAiSummary &&
        (isExpanded || !shouldTruncate) && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              <strong>Insights:</strong> {entry.ai_insights}
            </p>
          </div>
        )}

      {/* Show AI data indicator when collapsed */}
      {showAiData &&
        (entry.ai_summary || entry.ai_insights) &&
        !isExpanded &&
        shouldTruncate && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                AI analysis available - expand to view
              </span>
            </div>
          </div>
        )}
    </div>
  );
};

JournalEntryCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string, // Made optional since backend doesn't provide title
    content: PropTypes.string.isRequired,
    mood_rating: PropTypes.number,
    sentiment: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    ai_summary: PropTypes.string,
    ai_insights: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showAiData: PropTypes.bool,
};

export default JournalEntryCard;
