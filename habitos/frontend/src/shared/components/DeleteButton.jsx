import React from "react";
import { Trash2 } from "lucide-react";

const DeleteButton = ({
  onClick,
  children = "Delete",
  size = "default",
  variant = "default",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    default:
      "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600",
    outline:
      "border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20",
    ghost:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label="Delete"
      {...props}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      <span>{children}</span>
    </button>
  );
};

export default DeleteButton;
