import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  TrendingUp,
  MessageCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
} from "lucide-react";
import { useJournal } from "../hooks/useJournal";
import JournalEntryCard from "../components/journal/JournalEntryCard";
import JournalEditModal from "../components/journal/JournalEditModal";
import JournalFilters from "../components/journal/JournalFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import Tag from "../components/common/Tag";

const JournalPage = () => {
  const {
    entries,
    loading,
    error,
    filters,
    sentiments,
    updateFilters,
    clearFilters,
    deleteEntry,
    updateEntry,
    refresh,
  } = useJournal();

  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);

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
      return (
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.ai_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.ai_insights?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getSentimentVariant = (sentiment) => {
    if (sentiment === "positive") return "success";
    if (sentiment === "negative") return "danger";
    if (sentiment === "neutral") return "info";
    return "info"; // Default
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Daily Reflections
          </h1>
          <p className="text-gray-600 mt-2">
            A chronological log of your daily thoughts and experiences from your
            check-ins
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEntries}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Mood</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
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
          sentiments={sentiments}
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {sortOrder === "desc" ? (
                  <>
                    <SortDesc className="w-4 h-4" />
                    <span>Newest First</span>
                  </>
                ) : (
                  <>
                    <SortAsc className="w-4 h-4" />
                    <span>Oldest First</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => (window.location.href = "/check-ins")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Reflection</span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {filteredAndSortedEntries.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedEntries.length} of {entries.length}{" "}
              entries
            </p>
            {searchTerm && (
              <Tag
                variant="info"
                size="sm"
                removable
                onRemove={() => setSearchTerm("")}
              >
                Search: "{searchTerm}"
              </Tag>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Journal Entries */}
        <div className="space-y-6">
          {filteredAndSortedEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No entries found" : "No reflections yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms or filters."
                  : "Start your daily check-ins to build a collection of meaningful reflections."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => (window.location.href = "/check-ins")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Your First Check-In
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showAiData={filters.includeAiData}
              />
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Journal Entry"
          message="Are you sure you want to delete this journal entry? This action cannot be undone."
        />

        {/* Edit Modal */}
        <JournalEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEntryToEdit(null);
          }}
          entry={entryToEdit}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
};

export default JournalPage;
