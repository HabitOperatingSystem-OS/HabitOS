import React from "react";
import PropTypes from "prop-types";
import { AlertCircle, X, RefreshCw } from "lucide-react";

const ErrorMessage = ({
  message,
  title = "Error",
  variant = "error",
  onRetry,
  onDismiss,
  className = "",
  showIcon = true,
}) => {
  const variants = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
      iconBg: "bg-red-100",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`rounded-lg border p-4 ${currentVariant.bg} ${currentVariant.border} ${className}`}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div
            className={`w-5 h-5 ${currentVariant.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
          >
            <AlertCircle className={`w-3 h-3 ${currentVariant.icon}`} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-medium ${currentVariant.text} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${currentVariant.text}`}>{message}</p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`p-1 rounded hover:${currentVariant.bg.replace(
                "bg-",
                "bg-"
              )} transition-colors`}
              title="Retry"
            >
              <RefreshCw className={`w-4 h-4 ${currentVariant.icon}`} />
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`p-1 rounded hover:${currentVariant.bg.replace(
                "bg-",
                "bg-"
              )} transition-colors`}
              title="Dismiss"
            >
              <X className={`w-4 h-4 ${currentVariant.icon}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(["error", "warning", "info"]),
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
};

export default ErrorMessage;
