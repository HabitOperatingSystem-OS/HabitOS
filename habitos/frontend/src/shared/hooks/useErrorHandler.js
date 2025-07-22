import { useState, useCallback } from "react";

export const useErrorHandler = (initialError = null) => {
  const [error, setError] = useState(initialError);

  const handleError = useCallback((error) => {
    console.error("Error caught by useErrorHandler:", error);

    // Handle different types of errors
    if (error?.response?.status === 401) {
      setError(
        "You are not authorized to perform this action. Please log in again."
      );
    } else if (error?.response?.status === 403) {
      setError("You don't have permission to access this resource.");
    } else if (error?.response?.status === 404) {
      setError("The requested resource was not found.");
    } else if (error?.response?.status >= 500) {
      setError("Server error. Please try again later.");
    } else if (error?.message) {
      setError(error.message);
    } else if (typeof error === "string") {
      setError(error);
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncOperation = useCallback(
    async (operation) => {
      try {
        clearError();
        return await operation();
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    setError,
    handleError,
    clearError,
    handleAsyncOperation,
  };
};
