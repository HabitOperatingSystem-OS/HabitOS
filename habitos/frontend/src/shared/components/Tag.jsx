import React from "react";

const Tag = ({
  children,
  variant = "default",
  size = "md",
  onClick,
  className = "",
  removable = false,
  onRemove,
}) => {
  const baseClasses =
    "inline-flex items-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500",
    primary: "bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500",
    success:
      "bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500",
    warning:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500",
    danger: "bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500",
    info: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 focus:ring-indigo-500",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const getVariantClasses = () => {
    return variants[variant] || variants.default;
  };

  const classes = `${baseClasses} ${getVariantClasses()} ${
    sizes[size]
  } ${className}`;

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={classes}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-current hover:bg-current hover:bg-opacity-20 focus:outline-none focus:ring-1 focus:ring-current"
          aria-label="Remove tag"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
