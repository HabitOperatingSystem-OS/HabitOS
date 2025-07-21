import React, { useState } from "react";
import {
  Calendar,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import Tag from "../common/Tag";

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
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    if (rating >= 4) return "text-orange-600";
    return "text-red-600";
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

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const shouldTruncate = entry.content.length > 200;
  const displayText = isExpanded ? entry.content : truncateText(entry.content);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`text-2xl ${getMoodColor(entry.mood_rating)}`}>
            {typeof entry.mood_rating === "number" && !isNaN(entry.mood_rating)
              ? getMoodEmoji(entry.mood_rating)
              : "—"}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {formatDate(entry.entry_date)}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
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
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Edit entry"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayText}
        </p>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
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

      {/* AI Summary */}
      {showAiData && entry.ai_summary && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              AI Reflection
            </span>
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="text-purple-600 hover:text-purple-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
            >
              {showAiSummary ? "Hide" : "Show"}
            </button>
          </div>

          {showAiSummary && (
            <p className="text-sm text-purple-700 leading-relaxed">
              {entry.ai_summary}
            </p>
          )}
        </div>
      )}

      {/* AI Insights */}
      {showAiData && entry.ai_insights && showAiSummary && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 leading-relaxed">
            <strong>Insights:</strong> {entry.ai_insights}
          </p>
        </div>
      )}

      {/* Footer */}
      {/* Remove created/updated date footer */}
    </div>
  );
};

export default JournalEntryCard;
