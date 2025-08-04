import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  TrendingUp,
  Search,
  SortAsc,
  SortDesc,
  Brain,
  Sparkles,
} from "lucide-react";
import { useJournal } from "../../shared/hooks/useJournal";
import JournalEntryCard from "./JournalEntryCard";
import JournalEditModal from "./JournalEditModal";
import JournalFilters from "./JournalFilters";
import SimpleAIDashboard from "./SimpleAIDashboard";
import {
  LoadingSpinner,
  DeleteConfirmModal,
  Tag,
  MonthlyAISummaryModal,
} from "../../shared/components";
import { getSearchableAIInsights } from "../../utils/aiInsightsUtils";

const JournalPage = () => {
  const {
    entries,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    deleteEntry,
    updateEntry,
  } = useJournal();

  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [showAIDashboard, setShowAIDashboard] = useState(false);
  const [showMonthlySummaryModal, setShowMonthlySummaryModal] = useState(false);

  // Calculate stats
  const moodEntries = entries.filter(
    (e) => typeof e.mood_rating === "number" && !isNaN(e.mood_rating)
  );
  const stats = {
    totalEntries: entries.length,
    thisMonth: entries.filter((entry) => {
      const [year, month] = entry.entry_date.split("-");
      const now = new Date();
      return (
        Number(year) === now.getFullYear() &&
        Number(month) === now.getMonth() + 1
      );
    }).length,
    averageMood:
      moodEntries.length > 0
        ? Math.round(
            (moodEntries.reduce((sum, entry) => sum + entry.mood_rating, 0) /
              moodEntries.length) *
              10
          ) / 10
        : null,
  };

  // Filter and sort entries
  const filteredAndSortedEntries = entries
    .filter((entry) => {
      if (!searchTerm) return true;
      const searchableAIInsights = getSearchableAIInsights(entry.ai_insights);
      return (
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.ai_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchableAIInsights.includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.entry_date);
      const dateB = new Date(b.entry_date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = (entryId) => {
    setEntryToDelete(entryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        await deleteEntry(entryToDelete);
        setShowDeleteModal(false);
        setEntryToDelete(null);
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const handleEdit = (entry) => {
    setEntryToEdit(entry);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (entryId, updatedData) => {
    try {
      await updateEntry(entryId, updatedData);
      setShowEditModal(false);
      setEntryToEdit(null);
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  };

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
    if (rating >= 9) return "text-green-600";
    if (rating >= 8) return "text-blue-600";
    if (rating >= 7) return "text-purple-600";
    if (rating >= 6) return "text-yellow-600";
    if (rating >= 5) return "text-orange-600";
    if (rating >= 4) return "text-red-600";
    if (rating >= 3) return "text-pink-600";
    if (rating >= 2) return "text-gray-600";
    return "text-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <LoadingSpinner text="Loading journal entries..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <div className="card-premium p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Journal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="container-premium section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Daily Reflections
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            A chronological log of your daily thoughts and experiences from your
            check-ins
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalEntries}
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.thisMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Mood
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageMood !== null ? stats.averageMood : "—"}
                  </span>
                  {stats.averageMood !== null && (
                    <span className="text-xl">
                      {getMoodEmoji(Math.round(stats.averageMood))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <JournalFilters
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
        />

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMonthlySummaryModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>🧠 Generate Monthly AI Summary</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sort:
              </span>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {sortOrder === "desc" ? (
                  <SortDesc className="w-4 h-4" />
                ) : (
                  <SortAsc className="w-4 h-4" />
                )}
                <span>
                  {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Entries List */}
        {filteredAndSortedEntries.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No entries found" : "No journal entries yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Start your journaling journey by completing your first check-in"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => (window.location.href = "/check-ins")}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Start Your First Check-in</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => handleEdit(entry)}
                onDelete={() => handleDelete(entry.id)}
                getMoodEmoji={getMoodEmoji}
                getMoodColor={getMoodColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <JournalEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        entry={entryToEdit}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
      />

      {/* Monthly AI Summary Modal */}
      <MonthlyAISummaryModal
        isOpen={showMonthlySummaryModal}
        onClose={() => setShowMonthlySummaryModal(false)}
        month={new Date().toISOString().slice(0, 7)} // Current month in YYYY-MM format
      />

      {/* AI Dashboard Modal */}
      {showAIDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-premium-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Journal Assistant
              </h2>
              <button
                onClick={() => setShowAIDashboard(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                <SimpleAIDashboard onBack={() => setShowAIDashboard(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
