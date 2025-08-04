import React from "react";
import PropTypes from "prop-types";
import { LoadingSpinner, Skeleton } from "./index";

const PageLoader = ({
  type = "spinner",
  message = "Loading...",
  skeletonCount = 3,
  className = "",
}) => {
  if (type === "skeleton") {
    return (
      <div className={`container-responsive py-8 ${className}`}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton type="text" lines={1} height="h-8" width="w-1/3" />
            <Skeleton type="text" lines={1} height="h-4" width="w-1/2" />
          </div>

          {/* Content skeletons */}
          <div className="grid-responsive">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <Skeleton key={index} type="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}
    >
      <div className="text-center">
        <LoadingSpinner size="xl" text={message} />
      </div>
    </div>
  );
};

PageLoader.propTypes = {
  type: PropTypes.oneOf(["spinner", "skeleton"]),
  message: PropTypes.string,
  skeletonCount: PropTypes.number,
  className: PropTypes.string,
};

export default PageLoader;
