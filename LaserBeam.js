// src/components/LaserBeam.js
import React, { useEffect } from 'react';

const LaserBeam = () => {
  useEffect(() => {
    const laserBeam = document.getElementById('laser-beam');
    laserBeam.addEventListener('animationiteration', () => {
      laserBeam.style.display = 'none';
    });
  }, []);

  return <div id="laser-beam" className="laser-beam"></div>;
};

export default LaserBeam;