import React, { useState } from "react";
import PropTypes from "prop-types";
import { Edit, ChevronDown, ChevronUp, Clock, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteButton, Tag } from "../../shared/components";

const JournalEntryCard = ({ entry, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getMoodBgColor = (rating) => {
    if (rating >= 8)
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (rating >= 6)
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    if (rating >= 4)
      return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate if content needs truncation based on both character count and visual height
  const maxChars = 200;
  const maxLines = 4;
  const lineHeight = 1.6; // rem
  const maxHeight = maxLines * lineHeight; // 6.4rem

  // Check if content exceeds character limit or has excessive line breaks
  const hasExcessiveLineBreaks = (text) => {
    const lines = text.split("\n");
    return lines.length > maxLines;
  };

  const shouldTruncate =
    entry.content.length > maxChars || hasExcessiveLineBreaks(entry.content);

  const truncateText = (text, maxLength = maxChars) => {
    if (text.length <= maxLength && !hasExcessiveLineBreaks(text)) return text;

    // If text has excessive line breaks, truncate by lines first
    if (hasExcessiveLineBreaks(text)) {
      const lines = text.split("\n");
      const truncatedLines = lines.slice(0, maxLines);
      return truncatedLines.join("\n") + "...";
    }

    // Otherwise truncate by character count
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > maxLength * 0.8
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  };

  const displayText = isExpanded ? entry.content : truncateText(entry.content);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -2 },
  };

  const contentVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: "auto", opacity: 1 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-100/20 dark:from-primary-900/10 dark:via-transparent dark:to-primary-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          {/* Left: Date and Mood */}
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl ${getMoodBgColor(entry.mood_rating)}`}
            >
              <div className={`text-2xl ${getMoodColor(entry.mood_rating)}`}>
                {typeof entry.mood_rating === "number" &&
                !isNaN(entry.mood_rating)
                  ? getMoodEmoji(entry.mood_rating)
                  : "—"}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {formatDate(entry.entry_date)}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(entry.created_at)}</span>
                </div>
                {typeof entry.mood_rating === "number" &&
                  !isNaN(entry.mood_rating) && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Heart className="w-3 h-3" />
                      <span>{entry.mood_rating}/10</span>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right: Actions and Tags */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(entry)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Edit entry"
            >
              <Edit className="w-4 h-4" />
            </motion.button>

            <DeleteButton
              onClick={() => onDelete(entry.id)}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
              aria-label="Delete entry"
            />
          </div>
        </div>

        {/* Content Section - Fixed Height Container */}
        <div className="mb-4">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {!isExpanded && shouldTruncate ? (
              <div
                className="overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: maxLines,
                  WebkitBoxOrient: "vertical",
                  lineHeight: `${lineHeight}`,
                  maxHeight: `${maxHeight}rem`,
                }}
              >
                {displayText}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{displayText}</div>
            )}
          </div>

          {/* Read More/Less Button */}
          {shouldTruncate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-lg transition-colors"
              aria-expanded={isExpanded}
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
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

JournalEntryCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    mood_rating: PropTypes.number,

    tags: PropTypes.arrayOf(PropTypes.string),
    ai_summary: PropTypes.string,
    entry_date: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default JournalEntryCard;
