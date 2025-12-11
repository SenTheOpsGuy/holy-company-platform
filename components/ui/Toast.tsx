'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

export default function Toast({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  isVisible,
}: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-black',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform',
        typeStyles[type],
        show
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <span className="flex-shrink-0 text-lg">
        {icons[type]}
      </span>
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          onClick={() => {
            setShow(false);
            setTimeout(() => onClose(), 300);
          }}
          className="flex-shrink-0 ml-2 text-lg opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Toast hook for easy usage
import { useCallback, useState as useToastState } from 'react';

export function useToast() {
  const [toast, setToast] = useToastState<{
    message: string;
    type: ToastProps['type'];
    isVisible: boolean;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent: toast ? (
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    ) : null,
  };
}