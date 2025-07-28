import React from "react";
import {
  Target,
  TrendingUp,
  Activity,
  Award,
  Target as TargetIcon,
  BookOpen,
  Sparkles,
  Zap,
  Heart,
  Brain,
  CheckCircle,
  Calendar,
  Trophy,
} from "lucide-react";

import { useDashboard } from "../../shared/hooks/useDashboard";
import StreakChart from "./StreakChart";
import TodayHabits from "./TodayHabits";
import MoodSummary from "./MoodSummary";
import StatsCard from "./StatsCard";
import { LoadingSpinner } from "../../shared/components";
import { Card, CardContent } from "../../components/ui/card";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { dashboardData, userData, loading, error, refreshData } =
    useDashboard();

  console.log("Dashboard render - userData:", userData);
  console.log("Dashboard render - dashboardData:", dashboardData);

  const handleToggleHabit = (habitId) => {
    // This would typically make an API call to update the habit status
    console.log("Toggling habit:", habitId);
    // For now, we'll just refresh the data
    refreshData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <LoadingSpinner
            size="lg"
            text="Loading your wellness dashboard..."
            variant="wellness"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshData} variant="default">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground">
                Unable to load dashboard data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { stats, streakData, todaysHabits, moodSummary } = dashboardData;

  // Helper function to get first name from username or email
  const getFirstName = (name) => {
    if (!name) return "User";
    // Extract first name from username or email
    const firstName = name.split(/[@\s]/)[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="container-premium section-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="text-center mb-8">
              <motion.h1
                className="text-4xl lg:text-5xl font-bold text-gradient-wellness mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Welcome back,{" "}
                {getFirstName(userData?.username || userData?.email || "User")}{" "}
                👋
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Here's your wellness journey today
              </motion.p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="grid-premium-4">
              <StatsCard
                title="Active Habits"
                value={stats.activeHabits}
                subtitle={`${
                  stats.activeHabits > 0
                    ? "Currently tracking"
                    : "No active habits"
                }`}
                icon={TargetIcon}
                color="blue"
              />
              <StatsCard
                title="Current Streak"
                value={stats.currentStreak}
                subtitle="Consecutive days"
                icon={Activity}
                color="green"
              />
              <StatsCard
                title="Completion Rate"
                value={stats.completionRate}
                subtitle="Last 30 days"
                icon={CheckCircle}
                color="purple"
              />
              <StatsCard
                title="Goals Achieved"
                value={stats.goalsAchieved}
                subtitle={`${
                  stats.totalGoals > 0
                    ? `${stats.goalsAchieved}/${stats.totalGoals} total`
                    : "No goals set"
                }`}
                icon={Trophy}
                color="orange"
              />
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Streak Chart */}
            <motion.div variants={itemVariants}>
              <StreakChart data={streakData} />
            </motion.div>

            {/* Today's Habits and Mood Summary Grid */}
            <motion.div variants={itemVariants} className="grid-premium-2">
              <TodayHabits
                habits={todaysHabits}
                onToggleHabit={handleToggleHabit}
              />
              <MoodSummary moodData={moodSummary} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
