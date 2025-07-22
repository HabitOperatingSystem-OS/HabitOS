import { useState, useEffect, useCallback } from "react";
import { journalAPI } from "../../services/api";

export const useJournal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    sentiment: null,
    includeAiData: true,
  });
  const [sentiments, setSentiments] = useState([]);

  // Load available sentiments
  const loadSentiments = useCallback(async () => {
    try {
      const response = await journalAPI.getSentiments();
      setSentiments(response.sentiments);
    } catch (err) {
      console.error("Error loading sentiments:", err);
    }
  }, []);

  // Load journal entries with filters
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await journalAPI.getJournalEntries(filters);
      setEntries(response.journal_entries || []);
    } catch (err) {
      console.error("Error loading journal entries:", err);
      setError(err.message || "Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters and reload entries
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      sentiment: null,
      includeAiData: true,
    });
  }, []);

  // Create new journal entry
  const createEntry = useCallback(
    async (entryData) => {
      try {
        const response = await journalAPI.createJournalEntry(entryData);
        await loadEntries(); // Reload entries to include the new one
        return response;
      } catch (err) {
        console.error("Error creating journal entry:", err);
        throw err;
      }
    },
    [loadEntries]
  );

  // Update journal entry
  const updateEntry = useCallback(
    async (id, entryData) => {
      try {
        const response = await journalAPI.updateJournalEntry(id, entryData);
        await loadEntries(); // Reload entries to reflect changes
        return response;
      } catch (err) {
        console.error("Error updating journal entry:", err);
        throw err;
      }
    },
    [loadEntries]
  );

  // Delete journal entry
  const deleteEntry = useCallback(
    async (id) => {
      try {
        await journalAPI.deleteJournalEntry(id);
        await loadEntries(); // Reload entries to remove the deleted one
      } catch (err) {
        console.error("Error deleting journal entry:", err);
        throw err;
      }
    },
    [loadEntries]
  );

  // Analyze sentiment for text
  const analyzeSentiment = useCallback(async (content) => {
    try {
      const response = await journalAPI.analyzeSentiment(content);
      return response;
    } catch (err) {
      console.error("Error analyzing sentiment:", err);
      throw err;
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadSentiments();
  }, [loadSentiments]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    filters,
    sentiments,
    updateFilters,
    clearFilters,
    createEntry,
    updateEntry,
    deleteEntry,
    analyzeSentiment,
    refresh: loadEntries,
  };
};
