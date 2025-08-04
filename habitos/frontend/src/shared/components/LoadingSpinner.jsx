import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  text = "Loading...",
  className = "",
  variant = "default",
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const variants = {
    default:
      "border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400",
    primary:
      "border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400",
    white: "border-white/20 border-t-white",
    dark: "border-gray-300 dark:border-gray-600 border-t-gray-700 dark:border-t-gray-300",
    wellness:
      "border-wellness-lavender/30 dark:border-wellness-lavender/20 border-t-wellness-lavender dark:border-t-wellness-lavender/80",
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-4 sm:p-8 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 ${variants[variant]}`}
          role="status"
          aria-label="Loading"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Premium wellness variant with sparkles */}
        {variant === "wellness" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles
              className={`${sizeClasses[size]
                .replace("w-", "w-")
                .replace("h-", "h-")
                .replace("w-12", "w-6")
                .replace("h-12", "h-6")
                .replace("w-16", "w-8")
                .replace(
                  "h-16",
                  "h-8"
                )} text-wellness-lavender dark:text-wellness-lavender/80`}
            />
          </motion.div>
        )}
      </div>

      {text && (
        <motion.p
          className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground text-center font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}

      {/* Animated dots for extra flair */}
      <motion.div
        className="flex space-x-1 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-wellness-lavender to-wellness-indigo dark:from-wellness-lavender/80 dark:to-wellness-indigo/80 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-wellness-lavender to-wellness-indigo dark:from-wellness-lavender/80 dark:to-wellness-indigo/80 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-wellness-lavender to-wellness-indigo dark:from-wellness-lavender/80 dark:to-wellness-indigo/80 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </motion.div>
    </motion.div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  text: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "primary", "white", "dark", "wellness"]),
};

export default LoadingSpinner;
