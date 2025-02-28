// src/components/ProgressBar.js
import React, { useState, useEffect } from 'react';

const ProgressBar = ({ watchTime }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newProgress = (watchTime % (5 * 60 * 1000)) / (5 * 60 * 1000) * 100;
      setProgress(newProgress);
    }, 10);

    return () => clearInterval(interval);
  }, [watchTime]);

  return (
    <div id="progress-bar-container">
      <div id="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default ProgressBar;