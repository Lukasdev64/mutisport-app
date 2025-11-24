import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  return (
    <div className={`loading-spinner-container ${fullScreen ? 'loading-spinner-container--full-screen' : ''}`}>
      <div className="loading-spinner" aria-label="Loading" />
    </div>
  );
};
