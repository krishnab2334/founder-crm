import React from 'react';
import './LoadingSpinner.css'; // You'll need to create this file too

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;