// src/components/ui/Snackbar.jsx
import React, { useEffect } from 'react';

const Snackbar = ({ open, message, severity = 'success', onClose, autoHideDuration = 3000 }) => {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  return (
    <div className={`snackbar snackbar-${severity}`}>
      <span className="snackbar-message">{message}</span>
      <button 
        className="snackbar-close"
        onClick={onClose}
        aria-label="Закрыть уведомление"
      >
        ×
      </button>
    </div>
  );
};

export default Snackbar;