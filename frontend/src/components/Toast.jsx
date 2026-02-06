import { useEffect } from "react";

const Toast = ({ type = "info", message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-600 border-green-500",
    error: "bg-red-600 border-red-500",
    info: "bg-blue-600 border-blue-500",
    warning: "bg-yellow-600 border-yellow-500",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`
        ${typeStyles[type]}
        border-l-4 px-4 py-3 rounded-lg shadow-lg
        flex items-center justify-between gap-3
        animate-slide-in-right
        min-w-[300px] max-w-[500px]
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl text-white">{icons[type]}</span>
        <p className="text-white font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
