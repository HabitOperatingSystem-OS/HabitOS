import { useState, useEffect, useCallback } from "react";
import { habitsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!user || !user.token) {
        console.warn("No authentication token found, using mock data");
        // Fallback to mock data when not authenticated
        const mockHabits = [
          {
            id: "1",
            title: "Morning Exercise",
            category: "fitness",
            frequency: "daily",
            frequency_count: 0,
            current_streak: 7,
            longest_streak: 12,
            active: true,
            start_date: "2024-01-01",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
            is_due_today: true,
          },
          {
            id: "2",
            title: "Read 30 minutes",
            category: "learning",
            frequency: "daily",
            frequency_count: 0,
            current_streak: 5,
            longest_streak: 8,
            active: true,
            start_date: "2024-01-05",
            created_at: "2024-01-05T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
            is_due_today: false,
          },
          {
            id: "3",
            title: "Drink 8 glasses water",
            category: "health",
            frequency: "daily",
            frequency_count: 0,
            current_streak: 3,
            longest_streak: 5,
            active: true,
            start_date: "2024-01-10",
            created_at: "2024-01-10T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
            is_due_today: true,
          },
          {
            id: "4",
            title: "Meditation",
            category: "mindfulness",
            frequency: "daily",
            frequency_count: 0,
            current_streak: 12,
            longest_streak: 15,
            active: true,
            start_date: "2023-12-01",
            created_at: "2023-12-01T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
            is_due_today: true,
          },
          {
            id: "5",
            title: "Journal Entry",
            category: "personal",
            frequency: "daily",
            frequency_count: 0,
            current_streak: 2,
            longest_streak: 7,
            active: false,
            start_date: "2024-01-12",
            created_at: "2024-01-12T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
            is_due_today: false,
          },
        ];
        setHabits(mockHabits);
        return;
      }

      // Only make API call if authenticated
      try {
        const response = await habitsAPI.getHabits();
        setHabits(response.habits || []);
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError.message);
        // Fallback to mock data
        setHabits(mockHabits);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]); // Re-run when user changes

  const refreshHabits = useCallback(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    refreshHabits,
  };
};
