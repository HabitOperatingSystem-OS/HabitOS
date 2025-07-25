import React from "react";
import {
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Settings,
  Activity,
  Award,
  Target as TargetIcon,
  BookOpen,
  Sparkles,
  Zap,
  Heart,
  Brain,
} from "lucide-react";

import { useDashboard } from "../../shared/hooks/useDashboard";
import StreakChart from "./StreakChart";
import TodayHabits from "./TodayHabits";
import MoodSummary from "./MoodSummary";
import StatsCard from "./StatsCard";
import { LoadingSpinner } from "../../shared/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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
                <BarChart3 className="w-8 h-8 text-red-600 dark:text-red-400" />
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
                <BarChart3 className="w-8 h-8 text-gray-400" />
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
                Welcome back, {userData?.username || "User"}! ✨
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

            {/* Wellness Status */}
            <div className="grid-premium-4 mb-8">
              <Card className="card-glass">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-wellness-sage to-wellness-emerald rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Wellness Score
                      </p>
                      <p className="text-2xl font-bold text-gradient-wellness">
                        92%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-wellness-lavender to-wellness-indigo rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Mental Fitness
                      </p>
                      <p className="text-2xl font-bold text-gradient-wellness">
                        88%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-wellness-coral to-wellness-rose rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Energy Level
                      </p>
                      <p className="text-2xl font-bold text-gradient-wellness">
                        85%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-wellness-amber to-wellness-sky rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Focus Score
                      </p>
                      <p className="text-2xl font-bold text-gradient-wellness">
                        90%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="grid-premium-4">
              <StatsCard
                title="Active Habits"
                value={stats.activeHabits}
                change="+2"
                changeType="positive"
                icon={TargetIcon}
                color="blue"
              />
              <StatsCard
                title="Current Streak"
                value={`${stats.currentStreak} days`}
                change="+1"
                changeType="positive"
                icon={TrendingUp}
                color="green"
              />
              <StatsCard
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                change="+5%"
                changeType="positive"
                icon={Activity}
                color="purple"
              />
              <StatsCard
                title="Goals Achieved"
                value={stats.goalsAchieved}
                change="+1"
                changeType="positive"
                icon={Award}
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

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-gradient-wellness">
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Accelerate your wellness journey with these quick actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid-premium-2">
                    <Button
                      variant="wellness"
                      className="h-16 text-lg font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Add New Habit
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 text-lg font-semibold"
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      View Calendar
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 text-lg font-semibold"
                    >
                      <BarChart3 className="w-5 h-5 mr-3" />
                      View Analytics
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 text-lg font-semibold"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
