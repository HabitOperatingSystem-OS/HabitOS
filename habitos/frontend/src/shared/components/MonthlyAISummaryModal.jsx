import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  X,
  Sparkles,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Heart,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIMonthlySummary } from "../hooks/useAIMonthlySummary";

const MonthlyAISummaryModal = ({ isOpen, onClose, month }) => {
  const { loading, error, summary, generateMonthlySummary, clearSummary } =
    useAIMonthlySummary();
  const [currentMonth, setCurrentMonth] = useState(month);

  const handleGenerate = async () => {
    await generateMonthlySummary(currentMonth);
  };

  const handleClose = () => {
    clearSummary();
    onClose();
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return "Current Month";
    const [year, month] = monthStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Monthly AI Summary
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatMonth(currentMonth)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Generate summary"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Generating monthly summary...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    Failed to generate summary
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {error}
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {summary && typeof summary === "object" && !loading && !error && (
              <div className="space-y-6">
                {/* Monthly Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                    Monthly Overview
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {typeof summary.summary === "string"
                        ? summary.summary
                        : "No summary available"}
                    </p>
                    {summary.generated_at && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-3">
                        Generated{" "}
                        {new Date(summary.generated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Entry Statistics */}
                {typeof summary.entry_count === "number" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Heart className="h-5 w-5 text-green-600 mr-2" />
                      Journaling Stats
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {summary.entry_count}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Total Entries
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {summary.entry_count > 0
                            ? Math.round((summary.entry_count / 30) * 100)
                            : 0}
                          %
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Daily Average
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {summary.entry_count > 15
                            ? "Excellent"
                            : summary.entry_count > 10
                            ? "Good"
                            : "Keep Going"}
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Consistency
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Habit Recommendations */}
                {summary.recommendations &&
                  Array.isArray(summary.recommendations) &&
                  summary.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Target className="h-5 w-5 text-orange-600 mr-2" />
                        Habit Recommendations
                      </h3>
                      <div className="space-y-3">
                        {summary.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl"
                          >
                            <p className="text-gray-800 dark:text-gray-200">
                              {typeof rec === "string"
                                ? rec
                                : "Invalid recommendation"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Mood Trends */}
                {summary.mood_trends && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Mood Trends
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-gray-700 dark:text-gray-300">
                        {typeof summary.mood_trends === "string"
                          ? summary.mood_trends
                          : "No mood trends available"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!summary && !loading && !error && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Generate Monthly Summary
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get AI-powered insights about your journaling patterns, mood
                  trends, and habit recommendations for{" "}
                  {formatMonth(currentMonth)}.
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
                >
                  Generate Summary
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

MonthlyAISummaryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  month: PropTypes.string,
};

export default MonthlyAISummaryModal;
