import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const JournalEditModal = ({ isOpen, onClose, entry, onSave }) => {
  const [formData, setFormData] = useState({
    content: "",
    entry_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        content: entry.content || "",
        entry_date: entry.entry_date || "",
      });
      setError("");
    }
  }, [entry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(entry.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update journal entry");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl dark:shadow-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Edit Journal Entry
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Content Field */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
            >
              Journal Entry
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical bg-white dark:bg-zinc-800 text-black dark:text-white"
              placeholder="Write your thoughts, feelings, and experiences for this day..."
              required
            />
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {formData.content.length} characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalEditModal;
