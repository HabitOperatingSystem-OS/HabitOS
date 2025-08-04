import React, { useState } from "react";
import { Filter, X, Calendar } from "lucide-react";
import { Tag } from "../../shared/components";

const JournalFilters = ({ filters, onUpdateFilters, onClearFilters }) => {
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
      includeAiData: true,
    });
    onClearFilters();
  };

  const hasActiveFilters = filters.startDate || filters.endDate;

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
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={localFilters.startDate || ""}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value || null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={localFilters.endDate || ""}
                onChange={(e) =>
                  handleFilterChange("endDate", e.target.value || null)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalFilters;
