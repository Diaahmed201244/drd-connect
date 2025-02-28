// src/components/ExtraButton.js
import React from 'react';

const ExtraButton = () => {
  const handleClick = () => {
    document.body.classList.toggle('extra-mode');
  };

  return (
    <button id="extra-button" onClick={handleClick}>
      Extra
    </button>
  );
};

export default ExtraButton;