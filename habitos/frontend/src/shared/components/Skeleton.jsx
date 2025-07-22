import React from "react";
import PropTypes from "prop-types";

const Skeleton = ({
  type = "text",
  lines = 1,
  className = "",
  height = "h-4",
  width = "w-full",
}) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  if (type === "text") {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${height} ${
              index === lines - 1 ? width : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}
      >
        <div className="flex items-start space-x-3 mb-4">
          <div
            className={`${baseClasses} w-10 h-10 rounded-lg flex-shrink-0`}
          />
          <div className="flex-1 min-w-0">
            <div className={`${baseClasses} h-5 w-3/4 mb-2`} />
            <div className={`${baseClasses} h-4 w-1/2`} />
          </div>
        </div>
        <div className="space-y-3">
          <div className={`${baseClasses} h-4 w-full`} />
          <div className={`${baseClasses} h-4 w-5/6`} />
          <div className={`${baseClasses} h-4 w-4/6`} />
        </div>
      </div>
    );
  }

  if (type === "avatar") {
    return (
      <div
        className={`${baseClasses} ${height} ${width} rounded-full ${className}`}
      />
    );
  }

  if (type === "button") {
    return (
      <div
        className={`${baseClasses} ${height} ${width} rounded-md ${className}`}
      />
    );
  }

  return <div className={`${baseClasses} ${height} ${width} ${className}`} />;
};

Skeleton.propTypes = {
  type: PropTypes.oneOf(["text", "card", "avatar", "button", "custom"]),
  lines: PropTypes.number,
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
};

export default Skeleton;
