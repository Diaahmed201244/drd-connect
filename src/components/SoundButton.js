// src/components/SoundButton.js
import React from 'react';

const SoundButton = ({ player }) => {
  const handleClick = () => {
    if (player.isMuted()) {
      player.unMute();
    } else {
      player.mute();
    }
  };

  return (
    <button id="sound-button" onClick={handleClick}>
      Sound
    </button>
  );
};

export default SoundButton;