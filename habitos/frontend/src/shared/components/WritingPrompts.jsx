import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useAIWritingPrompts } from "../hooks/useAIWritingPrompts";

const WritingPrompts = ({ onPromptSelected, className = "" }) => {
  const {
    loading,
    error,
    prompts,
    generatePrompts,
    refreshPrompts,
    getTimeSinceLastRefresh,
  } = useAIWritingPrompts();

  useEffect(() => {
    // Generate prompts when component mounts
    generatePrompts({ count: 3 });
  }, [generatePrompts]);

  const handleRefresh = async () => {
    await refreshPrompts({ count: 3 });
  };

  const handlePromptClick = (prompt) => {
    if (onPromptSelected) {
      onPromptSelected(prompt);
    }
  };

  const formatTimeSinceRefresh = () => {
    const timeSince = getTimeSinceLastRefresh();
    if (!timeSince) return null;

    const seconds = Math.floor(timeSince / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (error) {
    return (
      <div
        className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl ${className}`}
      >
        <p className="text-red-700 dark:text-red-300 text-sm">
          Unable to load writing prompts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Writing Inspiration
          </h3>
          {formatTimeSinceRefresh() && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              • {formatTimeSinceRefresh()}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors rounded hover:bg-blue-100 dark:hover:bg-blue-800/30"
          title="Refresh prompts"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Prompts */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span className="text-sm italic">Generating fresh prompts...</span>
          </div>
        ) : prompts.length > 0 ? (
          prompts.map((prompt, index) => (
            <motion.button
              key={`${prompt.text || prompt}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handlePromptClick(prompt.text || prompt)}
              className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="flex items-start space-x-2">
                <Sparkles className="h-3 w-3 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-blue-800 dark:text-blue-200 italic leading-relaxed">
                  {prompt.text || prompt}
                </p>
              </div>
            </motion.button>
          ))
        ) : (
          <p className="text-sm text-blue-700 dark:text-blue-300 italic">
            No prompts available. Click refresh to generate new ones.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Click any prompt to use it as inspiration for your journal entry
        </p>
      </div>
    </div>
  );
};

WritingPrompts.propTypes = {
  onPromptSelected: PropTypes.func,
  className: PropTypes.string,
};

export default WritingPrompts;
