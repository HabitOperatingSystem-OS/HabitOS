import React from "react";
import PropTypes from "prop-types";

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
    default: "border-gray-200 border-t-blue-600",
    primary: "border-gray-200 border-t-primary-600",
    white: "border-white/20 border-t-white",
    dark: "border-gray-300 border-t-gray-700",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-8 ${className}`}
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 ${variants[variant]}`}
        role="status"
        aria-label="Loading"
      ></div>
      {text && (
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
          {text}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  text: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "primary", "white", "dark"]),
};

export default LoadingSpinner;
