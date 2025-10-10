import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);
  
  const types = {
    info: 'bg-blue-500',
    success: 'bg-success-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg shadow-lg',
        'bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5'
      )}
    >
      <div className="flex items-center p-4">
        <div className={cn('w-1 h-12 rounded-full mr-3', types[type])} />
        <p className="text-sm text-gray-900 dark:text-gray-100">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};