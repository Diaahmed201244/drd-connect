// src/components/ToggleButton.js
import React, { useState } from 'react';

const ToggleButton = ({ videoIds, videoNames, onToggle }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleToggle = () => {
    const nextIndex = (currentVideoIndex + 1) % videoIds.length;
    setCurrentVideoIndex(nextIndex);
    onToggle(videoIds[nextIndex]);
  };

  return (
    <button id="toggle-button" onClick={handleToggle}>
      {videoNames[currentVideoIndex]}
    </button>
  );
};

export default ToggleButton;