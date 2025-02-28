// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import Counter from './components/Counter';
import ToggleButton from './components/ToggleButton';
import ExtraButton from './components/ExtraButton';
import SoundButton from './components/SoundButton';
import NewsTicker from './components/NewsTicker';
import ProgressBar from './components/ProgressBar';
import CodeDisplay from './components/CodeDisplay';
import LaserBeam from './components/LaserBeam';
import PlayPauseButton from './components/PlayPauseButton';
import './App.css';

const App = () => {
  const [videoId, setVideoId] = useState('SJUH0qthtCA');
  const videoIds = ['PLD60YBjiIjQPryp_T2IdNm9fukceO8AtN', 'SJUH0qthtCA', 'fUehe82E5yU'];
  const videoNames = ['Home', 'Nour', 'Afra7'];

  const handleToggle = (newVideoId) => {
    setVideoId(newVideoId);
  };

  return (
    <div className="App">
      <Header />
      <VideoPlayer videoId={videoId} />
      <Counter />
      <ToggleButton videoIds={videoIds} videoNames={videoNames} onToggle={handleToggle} />
      <ExtraButton />
      <SoundButton />
      <NewsTicker />
      <ProgressBar />
      <CodeDisplay />
      <LaserBeam />
      <PlayPauseButton />
    </div>
  );
};

export default App;