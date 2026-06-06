'use client';

import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Notification({ notification, onRemove }) {
  const { id, message, type } = notification;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300); // Allow animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      default:
        return <CheckCircleIcon className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div
      className={`max-w-sm w-full p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getStyles()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(id), 300);
          }}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
