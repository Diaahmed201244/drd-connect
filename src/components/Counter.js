// src/components/Counter.js
import React, { useState, useEffect } from 'react';

const Counter = () => {
  const [watchTime, setWatchTime] = useState(parseInt(localStorage.getItem('watchTime')) || 0);
  const [timerInterval, setTimerInterval] = useState(null);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const decisecondsPart = Math.floor((milliseconds % 1000) / 10);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    const formattedDeciseconds = String(decisecondsPart).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedHours = String(hours).padStart(4, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedDeciseconds}`;
  };

  const startCounter = () => {
    if (!timerInterval) {
      const startTime = Date.now() - watchTime;
      const interval = setInterval(() => {
        const newWatchTime = Date.now() - startTime;
        setWatchTime(newWatchTime);
        localStorage.setItem('watchTime', newWatchTime);
      }, 10);
      setTimerInterval(interval);
    }
  };

  const stopCounter = () => {
    clearInterval(timerInterval);
    setTimerInterval(null);
  };

  useEffect(() => {
    startCounter();
    return () => stopCounter();
  }, []);

  return (
    <div id="counter-container">
      <span id="counter">{formatTime(watchTime)}</span>
    </div>
  );
};

export default Counter;