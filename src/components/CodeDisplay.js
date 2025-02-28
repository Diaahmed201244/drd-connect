// src/components/CodeDisplay.js
import React, { useState, useEffect } from 'react';

const CodeDisplay = () => {
  const [code, setCode] = useState(localStorage.getItem('uniqueCode') || '');

  const generateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newCode = 'FAKE-';
    for (let i = 0; i < 18; i++) {
      newCode += characters.charAt(Math.floor(Math.random() * characters.length));
      if ((i + 4 + 1) % 4 === 0 && i < 17) newCode += '-';
    }
    localStorage.setItem('uniqueCode', newCode);
    setCode(newCode);
  };

  useEffect(() => {
    if (!code) {
      generateCode();
    }
  }, [code]);

  return (
    <div id="code-display">
      {code}
    </div>
  );
};

export default CodeDisplay;