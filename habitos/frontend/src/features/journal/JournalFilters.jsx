import React, { useState } from "react";
import { Filter, X, Calendar, Smile } from "lucide-react";
import { Tag } from "../../shared/components";

const JournalFilters = ({
  filters,
  onUpdateFilters,
  onClearFilters,
  sentiments = [],
  showAiData = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onUpdateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      startDate: null,
      endDate: null,
      sentiment: null,
      includeAiData: true,
    });
    onClearFilters();
  };

  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.sentiment;

  const moodRanges = [
    { label: "Excellent (8-10)", min: 8, max: 10, color: "success" },
    { label: "Good (6-7)", min: 6, max: 7, color: "primary" },
    { label: "Okay (4-5)", min: 4, max: 5, color: "warning" },
    { label: "Poor (1-3)", min: 1, max: 3, color: "danger" },
  ];

  return (
    <div className="card-premium p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
          >
            {isExpanded ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.startDate && (
            <Tag
              variant="primary"
              size="sm"
              removable
              onRemove={() => handleFilterChange("startDate", null)}
            >
              From: {new Date(filters.startDate).toLocaleDateString()}
            </Tag>
          )}

          {filters.endDate && (
            <Tag
              variant="primary"
              size="sm"
              removable
              onRemove={() => handleFilterChange("endDate", null)}
            >
              To: {new Date(filters.endDate).toLocaleDateString()}
            </Tag>
          )}

          {filters.sentiment && (
            <Tag
              variant="info"
              size="sm"
              removable
              onRemove={() => handleFilterChange("sentiment", null)}
            >
              Sentiment:{" "}
              {filters.sentiment
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Tag>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={localFilters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value || null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={localFilters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value || null)
                  }
                  min={localFilters.startDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Sentiment Filter */}
          {sentiments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Sentiment
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange("sentiment", null)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    !localFilters.sentiment
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  All Sentiments
                </button>
                {sentiments.map((sentiment) => (
                  <button
                    key={sentiment.value}
                    onClick={() =>
                      handleFilterChange("sentiment", sentiment.value)
                    }
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      localFilters.sentiment === sentiment.value
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {sentiment.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Data Toggle */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Smile className="w-4 h-4" />
              <span>AI Features</span>
            </h4>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localFilters.includeAiData}
                onChange={(e) =>
                  handleFilterChange("includeAiData", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show AI-generated insights and summaries
              </span>
            </label>
          </div>

          {/* Quick Date Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Quick Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(
                    today.getTime() - 7 * 24 * 60 * 60 * 1000
                  );
                  handleFilterChange(
                    "startDate",
                    weekAgo.toISOString().split("T")[0]
                  );
                  handleFilterChange(
                    "endDate",
                    today.toISOString().split("T")[0]
                  );
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(
                    today.getTime() - 30 * 24 * 60 * 60 * 1000
                  );
                  handleFilterChange(
                    "startDate",
                    monthAgo.toISOString().split("T")[0]
                  );
                  handleFilterChange(
                    "endDate",
                    today.toISOString().split("T")[0]
                  );
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const yearAgo = new Date(
                    today.getTime() - 365 * 24 * 60 * 60 * 1000
                  );
                  handleFilterChange(
                    "startDate",
                    yearAgo.toISOString().split("T")[0]
                  );
                  handleFilterChange(
                    "endDate",
                    today.toISOString().split("T")[0]
                  );
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Last Year
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalFilters;
