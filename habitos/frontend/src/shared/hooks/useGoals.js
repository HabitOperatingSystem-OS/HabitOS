import { useState, useEffect } from "react";
import { goalsAPI, habitsAPI } from "../../services/api";

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get habit details for each goal
  const getHabitForGoal = (goal) => {
    return habits.find((habit) => habit.id === goal.habit_id);
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const [goalsResponse, habitsResponse] = await Promise.all([
        goalsAPI.getGoals(),
        habitsAPI.getHabits(),
      ]);

      setGoals(goalsResponse.goals || []);
      setHabits(habitsResponse.habits || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData) => {
    try {
      const response = await goalsAPI.createGoal(goalData);
      setGoals((prev) => [response.goal, ...prev]);
      return response.goal;
    } catch (err) {
      console.error("Failed to create goal:", err);
      throw err;
    }
  };

  const updateGoal = async (goalId, goalData) => {
    try {
      const response = await goalsAPI.updateGoal(goalId, goalData);
      console.log("Updating goal in state:", goalId, response.goal);
      setGoals((prev) => {
        const updated = prev.map((goal) =>
          goal.id === goalId ? response.goal : goal
        );
        console.log("Updated goals state:", updated);
        return updated;
      });
      return response.goal;
    } catch (err) {
      console.error("Failed to update goal:", err);
      throw err;
    }
  };

  const patchGoal = async (goalId, goalData) => {
    try {
      const response = await goalsAPI.patchGoal(goalId, goalData);
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? response.goal : goal))
      );
      return response.goal;
    } catch (err) {
      console.error("Failed to patch goal:", err);
      throw err;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await goalsAPI.deleteGoal(goalId);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (err) {
      console.error("Failed to delete goal:", err);
      throw err;
    }
  };

  const updateGoalProgress = async (goalId, progressData) => {
    try {
      const response = await goalsAPI.updateGoalProgress(goalId, progressData);
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? response.goal : goal))
      );
      return response.goal;
    } catch (err) {
      console.error("Failed to update goal progress:", err);
      throw err;
    }
  };

  const checkHabitGoal = async (habitId) => {
    try {
      const response = await goalsAPI.checkHabitGoal(habitId);
      return response;
    } catch (err) {
      console.error("Failed to check habit goal:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    habits,
    getHabitForGoal,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    patchGoal,
    deleteGoal,
    updateGoalProgress,
    checkHabitGoal,
  };
};
