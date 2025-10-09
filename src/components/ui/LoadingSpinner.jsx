import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', message = null, overlay = false }) => {
  const sizeClass = `spinner-${size}`;
  if (overlay) {
    return (
      <div className="spinner-overlay" role="status" aria-live="polite">
        <div className={`loading-spinner ${sizeClass}`}></div>
        {message && <p className="loading-message mt-3 text-xs">{message}</p>}
      </div>
    );
  }
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className={`loading-spinner ${sizeClass}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;