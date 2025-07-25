import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { motion } from "framer-motion";

const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = "blue",
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        gradient: "from-primary-600 to-primary-700",
        bg: "bg-primary-50/50 dark:bg-primary-900/20",
        text: "text-primary-700 dark:text-primary-300",
        border: "border-primary-200/50 dark:border-primary-800/50",
        iconBg: "bg-gradient-to-br from-primary-600 to-primary-700",
        iconText: "text-white",
        glow: "shadow-primary-500/20",
      },
      green: {
        gradient: "from-wellness-emerald to-wellness-sage",
        bg: "bg-green-50/50 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-200/50 dark:border-green-800/50",
        iconBg: "bg-gradient-to-br from-wellness-emerald to-wellness-sage",
        iconText: "text-white",
        glow: "shadow-green-500/20",
      },
      purple: {
        gradient: "from-wellness-lavender to-wellness-indigo",
        bg: "bg-purple-50/50 dark:bg-purple-900/20",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200/50 dark:border-purple-800/50",
        iconBg: "bg-gradient-to-br from-wellness-lavender to-wellness-indigo",
        iconText: "text-white",
        glow: "shadow-purple-500/20",
      },
      orange: {
        gradient: "from-wellness-amber to-wellness-coral",
        bg: "bg-orange-50/50 dark:bg-orange-900/20",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-200/50 dark:border-orange-800/50",
        iconBg: "bg-gradient-to-br from-wellness-amber to-wellness-coral",
        iconText: "text-white",
        glow: "shadow-orange-500/20",
      },
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`card-glass border ${colorClasses.border} group relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        ></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {Icon && (
                  <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.iconBg} shadow-lg ${colorClasses.glow}`}
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      },
                    }}
                  >
                    <Icon className={`w-6 h-6 ${colorClasses.iconText}`} />
                  </motion.div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {title}
                  </p>
                  <p className="text-3xl font-bold text-gradient-wellness">
                    {value}
                  </p>
                </div>
              </div>
            </div>

            {change && (
              <motion.div
                className={`flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-full ${
                  changeType === "positive"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {changeType === "positive" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold">{change}</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
