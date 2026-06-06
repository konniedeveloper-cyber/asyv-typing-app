'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SuccessModal({ isOpen, onClose, title, message, buttonText = "OK" }) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Success icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              {message}
            </p>

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
