import { useState, useEffect } from "react";
import { dashboardAPI, authAPI } from "../services/api";

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first, fallback to mock data if API is not available
      try {
        console.log("Fetching dashboard data...");
        const data = await dashboardAPI.getDashboardData();
        setDashboardData(data);

        console.log("Fetching user data...");
        const user = await authAPI.getCurrentUser();
        console.log("User data received:", user);
        setUserData(user.user);
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError.message);

        // Fallback to mock data
        const mockData = {
          streakData: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                label: "Habit Completion Streak",
                data: [5, 7, 6, 8, 9, 7, 8],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
          todaysHabits: [
            {
              id: 1,
              name: "Morning Exercise",
              category: "Fitness",
              streak: 7,
              completed: true,
              time: "07:00",
              mood: "energetic",
            },
            {
              id: 2,
              name: "Read 30 minutes",
              category: "Learning",
              streak: 5,
              completed: true,
              time: "20:00",
              mood: "focused",
            },
            {
              id: 3,
              name: "Drink 8 glasses water",
              category: "Health",
              streak: 3,
              completed: false,
              time: "Throughout day",
              mood: null,
            },
            {
              id: 4,
              name: "Meditation",
              category: "Mindfulness",
              streak: 12,
              completed: true,
              time: "06:30",
              mood: "calm",
            },
            {
              id: 5,
              name: "Journal Entry",
              category: "Reflection",
              streak: 2,
              completed: false,
              time: "21:00",
              mood: null,
            },
          ],
          moodSummary: {
            recentMoods: [
              { mood: "energetic", count: 3, percentage: 30 },
              { mood: "focused", count: 2, percentage: 20 },
              { mood: "calm", count: 2, percentage: 20 },
              { mood: "stressed", count: 1, percentage: 10 },
              { mood: "tired", count: 1, percentage: 10 },
              { mood: "happy", count: 1, percentage: 10 },
            ],
            averageMood: "energetic",
            totalCheckIns: 10,
          },
          stats: {
            activeHabits: 12,
            currentStreak: 7,
            completionRate: 85,
            goalsAchieved: 3,
          },
        };

        setDashboardData(mockData);
        // Set mock user data as fallback
        setUserData({
          username: "User",
          email: "user@example.com",
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    userData,
    loading,
    error,
    refreshData,
  };
};
