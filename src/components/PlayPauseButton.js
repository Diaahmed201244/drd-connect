// src/components/PlayPauseButton.js
import React from 'react';

const PlayPauseButton = ({ player }) => {
  const handleClick = () => {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  return (
    <button id="play-pause-button" onClick={handleClick}>
      
    </button>
  );
};

export default PlayPauseButton;