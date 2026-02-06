const Alert = ({ type = "info", message, onClose }) => {
  const typeClasses = {
    error: "alert-error",
    success: "alert-success",
    info: "alert-info",
  };

  const icons = {
    error: "❌",
    success: "✅",
    info: "ℹ️",
  };

  if (!message) return null;

  return (
    <div className={`${typeClasses[type]} flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span>{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
