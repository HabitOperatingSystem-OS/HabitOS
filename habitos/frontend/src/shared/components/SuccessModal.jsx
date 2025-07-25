import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

const SuccessModal = ({
  isOpen,
  onClose,
  title = "Success!",
  message = "Operation completed successfully",
  autoDismiss = true,
  dismissDelay = 3000,
}) => {
  useEffect(() => {
    if (isOpen && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss, dismissDelay, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl dark:shadow-zinc-800 max-w-md w-full mx-4 p-6 transform transition-all border border-zinc-200 dark:border-zinc-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>

          <h3 className="text-lg font-medium text-black dark:text-white mb-2">
            {title}
          </h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
