// src/components/VideoPlayer.js
import React, { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ videoId, channelId }) => {
  const videoContainerRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [watchTime, setWatchTime] = useState(parseInt(localStorage.getItem('watchTime')) || 0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFirstCodeAfterReload, setIsFirstCodeAfterReload] = useState(true);
  const toggleLongPressTimerRef = useRef(null);

  // Define the video/playlist IDs and their corresponding names
  const videoIds = [
    'PLD60YBjiIjQPryp_T2IdNm9fukceO8AtN', // Home (Playlist ID)
    'SJUH0qthtCA', // Nour (Single Video ID)
    'fUehe82E5yU', // Afra7 (Single Video ID)
  ];
  const videoNames = ['Home', 'Nour', 'Afra7'];

  // Load YouTube Iframe API script
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer(videoIds[currentVideoIndex]);
    };
  }, []);

  // Initialize YouTube player
  const createPlayer = (videoId) => {
    if (typeof window.YT === 'undefined' || !window.YT.Player) {
      console.error("YouTube Player API not loaded yet.");
      return;
    }

    const newPlayer = new window.YT.Player(videoContainerRef.current, {
      height: '450',
      width: '800',
      videoId: videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        autoplay: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
    setPlayer(newPlayer);
  };

  // Handle player ready event
  const onPlayerReady = (event) => {
    event.target.playVideo();

    if (lastPlaybackTime > 0) {
      event.target.seekTo(lastPlaybackTime);
    }

    if (player && player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      startCounter();
    }

    event.target.getIframe().contentWindow.document.querySelector('video').addEventListener('pause', hideRecommendedVideos);
  };

  // Handle player state change
  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startCounter();
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.BUFFERING) {
      stopCounter();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      stopCounter();
      handlePlaylistEnd();
    }
  };

  // Handle player error
  const onPlayerError = (event) => {
    console.error('Error with the player:', event.data);
    switchToNextSection();
  };

  // Start watch time counter
  const startCounter = () => {
    if (!timerInterval) {
      const interval = setInterval(() => {
        setWatchTime((prev) => prev + 1);
        localStorage.setItem('watchTime', watchTime + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  // Pause watch time counter
  const stopCounter = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Handle playlist end
  const handlePlaylistEnd = () => {
    if (videoIds[currentVideoIndex] === videoIds[0]) { // Home (Playlist)
      const savedData = JSON.parse(localStorage.getItem(videoIds[currentVideoIndex])) || {};
      player.loadPlaylist({
        listType: 'playlist',
        list: videoIds[currentVideoIndex],
        index: savedData.index || 0,
        startSeconds: savedData.time || 0,
      });
    } else {
      player.nextVideo();
    }
  };

  // Load the last played video/playlist from localStorage on component mount
  useEffect(() => {
    const lastPlayedVideoId = localStorage.getItem('lastPlayedVideoId') || videoIds[0];
    const index = videoIds.indexOf(lastPlayedVideoId);
    setCurrentVideoIndex(index);
    loadVideoOrPlaylist(lastPlayedVideoId);

    // Update the button text to show the current video/playlist name
    if (toggleButtonRef.current) {
      toggleButtonRef.current.textContent = videoNames[index];
    }
  }, []);

  // Function to load video or playlist
  const loadVideoOrPlaylist = (videoId) => {
    if (!player) return;

    const savedData = JSON.parse(localStorage.getItem(videoId)) || {};
    const startSeconds = savedData.time || 0;
    const startIndex = savedData.index || 0;

    if (videoId === videoIds[0]) { // Home (Playlist)
      player.loadPlaylist({
        listType: 'playlist',
        list: videoId,
        index: startIndex,
        startSeconds: startSeconds,
      });
    } else { // Nour or Afra7 (Single Video)
      player.loadVideoById({
        videoId: videoId,
        startSeconds: startSeconds,
      });
    }

    player.playVideo();
  };

  // Toggle button click event
  const handleToggleButtonClick = () => {
    if (!player) return;

    const currentTime = player.getCurrentTime();
    const currentIndex = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
    localStorage.setItem(videoIds[currentVideoIndex], JSON.stringify({
      time: currentTime,
      index: currentIndex,
    }));

    const nextIndex = (currentVideoIndex + 1) % videoIds.length;
    setCurrentVideoIndex(nextIndex);
    loadVideoOrPlaylist(videoIds[nextIndex]);

    if (toggleButtonRef.current) {
      toggleButtonRef.current.textContent = videoNames[nextIndex];
    }
  };

  // Long press functionality for the toggle button
  const handleLongPressStart = () => {
    toggleLongPressTimerRef.current = setTimeout(() => {
      window.location.href = `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`;
    }, 3000);
  };

  const handleLongPressEnd = () => {
    clearTimeout(toggleLongPressTimerRef.current);
  };

  // Save the last played video/playlist ID before the component unmounts
  useEffect(() => {
    return () => {
      localStorage.setItem('lastPlayedVideoId', videoIds[currentVideoIndex]);
    };
  }, [currentVideoIndex]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopCounter();
      } else {
        startCounter();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle keydown events (prevent reload)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'R') || (e.metaKey && e.key === 'R')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Buttons functionality
  useEffect(() => {
    const soundButton = document.getElementById('sound-button');
    const extraButton = document.getElementById('extra-button');
    const laserBeam = document.getElementById('laser-beam');

    if (soundButton) {
      soundButton.addEventListener('click', () => {
        if (player.isMuted()) {
          player.unMute();
          soundButton.textContent = '';
        } else {
          player.mute();
          soundButton.textContent = '';
        }
      });
    }

    if (extraButton) {
      extraButton.addEventListener('click', () => {
        document.body.classList.toggle('extra-mode');
      });
    }

    if (laserBeam) {
      laserBeam.addEventListener('animationiteration', () => {
        laserBeam.style.display = 'none';
      });
    }

    return () => {
      if (soundButton) soundButton.removeEventListener('click');
      if (extraButton) extraButton.removeEventListener('click');
      if (laserBeam) laserBeam.removeEventListener('animationiteration');
    };
  }, [player]);

  // Prevent interaction with the video container
  useEffect(() => {
    const touchOverlay = document.querySelector('.touch-overlay');
    if (touchOverlay) {
      touchOverlay.addEventListener('click', (event) => {
        event.stopPropagation();
      });
    }
  }, []);

  // Check internet connection periodically
  useEffect(() => {
    const interval = setInterval(checkInternetConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to check internet connection
  const checkInternetConnection = () => {
    // Implement your logic to check internet connection here
  };

  // Function to format time in milliseconds to hours, minutes, and seconds
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

  // Function to generate a code and save it to localStorage
  const generateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    // Generate FAKE code only once per reload
    if (isFirstCodeAfterReload) {
      code = 'FAKE-';
      for (let i = 0; i < 18; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
        if ((i + 4 + 1) % 4 === 0 && i < 17) code += '-';
      }
      setIsFirstCodeAfterReload(false); // Disable FAKE after first generation
    } else {
      // Normal code generation
      for (let i = 0; i < 22; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
        if ((i + 1) % 4 === 0 && i < 21) code += '-';
      }
    }

    // Save the generated code to localStorage
    const generatedCodes = JSON.parse(localStorage.getItem('generatedCodes')) || [];
    generatedCodes.push(code);
    localStorage.setItem('generatedCodes', JSON.stringify(generatedCodes));

    // Display the code
    localStorage.setItem('uniqueCode', code);
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay) {
      codeDisplay.textContent = code;
    }
    return code;
  };

  // Function to update the counter display
  const updateCounterDisplay = () => {
    const counterElement = document.getElementById('counter');
    if (counterElement) {
      const time = formatTime(watchTime);
      const digits = time.split('').map(digit => `
        <span>
          ${digit}
          <span class="shine"></span>
        </span>
      `).join('');
      counterElement.innerHTML = digits;
    } else {
      console.error("Counter element not found!");
    }
  };

  // Function to restart the video/playlist
  const restartVideo = () => {
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(0);
      player.playVideo();
    }
    console.log('Video/Playlist restarted');
  };

  // Function to show the user activity popup
  const showUserActivityPopup = () => {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.width = '300px';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.borderRadius = '10px';
    popup.style.padding = '20px';
    popup.style.zIndex = '10000';
    popup.style.color = 'white';
    popup.style.overflowY = 'auto';
    popup.style.maxHeight = '80vh';

    const totalWatchingTime = formatTime(watchTime);
    const remainingTime = formatTime(calculateRemainingTime());
    const allCodes = getAllGeneratedCodes();
    const usedCodes = getUsedCodes();
    const remainingCodes = getRemainingCodes();

    popup.innerHTML = `
      <h3 style="text-align: center; margin-bottom: 15px;">User Activity</h3>
      <div>
        <p><strong>Total Watching Time:</strong> ${totalWatchingTime}</p>
        <p><strong>Remaining Time:</strong> ${remainingTime}</p>
      </div>
      <div>
        <h4>All Generated Codes:</h4>
        <ul>
          ${allCodes.map(code => `<li>${code}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4>Used Codes:</h4>
        <ul>
          ${usedCodes.map(code => `<li>${code}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4>Remaining Codes:</h4>
        <ul>
          ${remainingCodes.map(code => `<li>${code}</li>`).join('')}
        </ul>
      </div>
    `;

    document.body.appendChild(popup);

    document.addEventListener('click', (event) => {
      if (!popup.contains(event.target)) {
        popup.remove();
      }
    }, { once: true });
  };

  // Function to calculate remaining time after purchases
  const calculateRemainingTime = () => {
    const purchasedTime = parseInt(localStorage.getItem('purchasedTime')) || 0;
    return watchTime - purchasedTime;
  };

  // Function to get all generated codes
  const getAllGeneratedCodes = () => {
    return JSON.parse(localStorage.getItem('generatedCodes')) || [];
  };

  // Function to get used codes
  const getUsedCodes = () => {
    return JSON.parse(localStorage.getItem('usedCodes')) || [];
  };

  // Function to get remaining codes
  const getRemainingCodes = () => {
    const allCodes = getAllGeneratedCodes();
    const usedCodes = getUsedCodes();
    return allCodes.filter(code => !usedCodes.includes(code));
  };

  // Function to mark a code as used
  const markCodeAsUsed = (code) => {
    const usedCodes = JSON.parse(localStorage.getItem('usedCodes')) || [];
    usedCodes.push(code);
    localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
  };

  // Function to handle screen orientation changes
  const handleOrientationChange = () => {
    const counterContainer = document.getElementById('counter-container');

    const updateOrientation = () => {
      if (screen.orientation.type.startsWith('landscape')) {
        counterContainer.style.display = 'none';
        enableTheatreMode(player);
      } else {
        counterContainer.style.display = 'flex';
        disableTheatreMode(player);
      }
    };

    screen.orientation.addEventListener('change', updateOrientation);
    updateOrientation();
  };

  // Function to enable theatre mode
  const enableTheatreMode = (player) => {
    const iframe = player.getIframe();
    iframe.classList.add('theatre-mode');
    document.body.classList.add('theatre-mode-active');
  };

  // Function to disable theatre mode
  const disableTheatreMode = (player) => {
    const iframe = player.getIframe();
    iframe.classList.remove('theatre-mode');
    document.body.classList.remove('theatre-mode-active');
  };

  // Function to update the laser beam position
  const updateLaserBeamPosition = () => {
    const codeContainer = document.getElementById('code-container');
    const laserBeam = document.getElementById('laser-beam');

    if (codeContainer && laserBeam) {
      const containerRect = codeContainer.getBoundingClientRect();
      laserBeam.style.transform = `translateX(${containerRect.left}px)`;
    }
  };

  // Call the function to update the laser beam position on page load and resize
  useEffect(() => {
    window.addEventListener('load', updateLaserBeamPosition);
    window.addEventListener('resize', updateLaserBeamPosition);
    return () => {
      window.removeEventListener('load', updateLaserBeamPosition);
      window.removeEventListener('resize', updateLaserBeamPosition);
    };
  }, []);

  return (
    <div>
      <div id="video-container" ref={videoContainerRef}></div>
      <button
        id="toggle-button"
        ref={toggleButtonRef}
        onClick={handleToggleButtonClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {videoNames[currentVideoIndex]}
      </button>
      <div id="counter-container">
        <div id="counter"></div>
      </div>
      <div id="code-container">
        <div id="code-display"></div>
        <div id="laser-beam"></div>
      </div>
      <button id="sound-button">Toggle Sound</button>
      <button id="extra-button">Extra Mode</button>
      <button id="restart-button" onClick={restartVideo}>Restart</button>
      <button id="activity-button" onClick={showUserActivityPopup}>Show Activity</button>
      <div className="touch-overlay"></div>
    </div>
  );
};

export default VideoPlayer;