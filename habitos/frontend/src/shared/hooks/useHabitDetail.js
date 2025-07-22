import { useState, useEffect } from "react";
import { habitsAPI, checkInsAPI } from "../../services/api";

export const useHabitDetail = (habitId) => {
  const [habit, setHabit] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabitData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first, fallback to mock data if API is not available
      try {
        // Fetch habit details
        const habitResponse = await habitsAPI.getHabit(habitId);
        setHabit(habitResponse.habit);

        // Fetch check-ins for this specific habit
        const checkInsResponse = await checkInsAPI.getHabitCheckIns(habitId);
        setCheckIns(checkInsResponse.check_ins || []);
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError.message);

        // Fallback to mock data
        const mockHabit = {
          id: habitId,
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
        };

        const mockCheckIns = [
          {
            id: "1",
            habit_id: habitId,
            completed: true,
            mood: "energetic",
            created_at: "2024-01-15T07:00:00Z",
          },
          {
            id: "2",
            habit_id: habitId,
            completed: true,
            mood: "focused",
            created_at: "2024-01-14T07:00:00Z",
          },
          {
            id: "3",
            habit_id: habitId,
            completed: true,
            mood: "calm",
            created_at: "2024-01-13T07:00:00Z",
          },
        ];

        setHabit(mockHabit);
        setCheckIns(mockCheckIns);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch habit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habitId) {
      fetchHabitData();
    }
  }, [habitId]);

  const refreshData = () => {
    fetchHabitData();
  };

  return {
    habit,
    checkIns,
    loading,
    error,
    refreshData,
  };
};
