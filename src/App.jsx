import { useState, useMemo, useCallback, useRef,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "./config";
import SnakeGame from "./SnakeGame";
import CatchHearts from "./CatchHearts";


//For new Password generation when you wants in future


// const encoder = new TextEncoder();
// const data = encoder.encode('your password');
// const hashBuffer = await crypto.subtle.digest('SHA-256', data);
// const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
// console.log(hashHex);



const CORRECT_HASH = "4c2a1c6301416b0e5291d0fd12d7aebc01f3b494fb4d39f2e9b6fa9c058099f9";


function App() {
  const [noLabel, setNoLabel] = useState("NO 💔");
  const [showHoverPopup, setShowHoverPopup] = useState(false);
  const [showSlidesPopup, setShowSlidesPopup] = useState(false);
  const [showProsConsPopup, setShowProsConsPopup] = useState(false);
  const [hoveredOnce, setHoveredOnce] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [view, setView] = useState("home");
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [giftsOpened, setGiftsOpened] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Media player state
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const videoRef = useRef(null);
  const SONGS_PER_PAGE = 5;

  const audioRef = useRef(null);

  // Song data for media player
  const songs = useMemo(() => config.songs, []);

  const slides = useMemo(() => config.prosCons, []);

const handleLogin = useCallback(async () => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (hashHex === CORRECT_HASH) {
    setIsLoggedIn(true);
    setPasswordError(false);
  } else {
    setPasswordError(true);
    setPassword('');
  }
}, [password]);

 useEffect(() => {

  if (!isLoggedIn) return;

  const heartEmojis = ['💗','💖','💕','❤️','💓','😘','🍫','💝','😍','🥰'];
  
  const createHeart = () => {
    const heart = document.createElement('span');
    heart.innerHTML = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}%;
      bottom: -50px;
      font-size: ${Math.random() * 20 + 15}px;
      pointer-events: none;
      z-index: 0;
      transition: none;
      animation: none;
    `;
    
    document.body.appendChild(heart);
    
    let pos = -50;
    const moveUp = setInterval(() => {
      pos += 3;
      heart.style.bottom = pos + 'px';
      heart.style.opacity = String(1 - (pos / window.innerHeight));
      
      if (pos > window.innerHeight) {
        clearInterval(moveUp);
        heart.remove();
      }
    }, 20);
  };

  const interval = setInterval(createHeart, 800);
  return () => clearInterval(interval);
}, [isLoggedIn]);

const [timeElapsed, setTimeElapsed] = useState({});

useEffect(() => {
  const calculateTime = () => {
    const metDate = new Date("2025-11-20");
    const now = new Date();
    const diff = now - metDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeElapsed({ days, hours, minutes, seconds });
  };

  calculateTime();
  const timer = setInterval(calculateTime, 1000);
  return () => clearInterval(timer);
}, []);

  const handleNoEnter = useCallback(() => {
    // if (!hoveredOnce) {
      setShowHoverPopup(true);
      setHoveredOnce(true);
    // } else {
    //   setNoLabel("YESSS ❤️");
    // }
  }, [hoveredOnce]);

  

  const handleNoLeave = useCallback(() => {
    if (hoveredOnce) {
      setNoLabel("NO 💔");
    }
  }, [hoveredOnce]);

  const closeHoverPopup = useCallback(() => {
    setShowHoverPopup(false);
    setNoLabel("NO 💔");
  }, []);

  const openProsConsPopup = useCallback(() => {
    setShowHoverPopup(false);
    setShowProsConsPopup(true);
  }, []);

  const closeProsConsPopup = useCallback(() => {
    setShowProsConsPopup(false);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Gift tracking functions
  const handleGiftClick = useCallback((giftType) => {
    setGiftsOpened((prev) => {
      const newSet = new Set(prev);
      newSet.add(giftType);
      return newSet;
    });
  }, []);

  const allGiftsOpened = useMemo(() => giftsOpened.size === 3, [giftsOpened]);

  const handleGift1Click = useCallback(() => {
    handleGiftClick("songs");
    setView("songs");
  }, [handleGiftClick]);

  const handleGift2Click = useCallback(() => {
    handleGiftClick("letter");
    setView("letter");
  }, [handleGiftClick]);

 const handleGift3Click = useCallback(() => {
  handleGiftClick("games");
  setView("games");
}, [handleGiftClick]);

  // Media player functions
  const currentSong = useMemo(
    () => songs[currentSongIndex],
    [songs, currentSongIndex],
  );

  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isVideoMode) {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  }, [isPlaying, isVideoMode]);

  const handleVideoToggle = useCallback(() => {
      if (!isVideoMode) {
        // Audio → Video: sync timestamp
        if (audioRef.current) {
          const syncTime = audioRef.current.currentTime;
          audioRef.current.pause();
          setIsVideoMode(true);
          setIsPlaying(true);
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = syncTime;
              videoRef.current.play();
            }
          }, 100);
        }
      } else {
        // Video → Audio: sync timestamp
        if (videoRef.current) {
          const syncTime = videoRef.current.currentTime;
          videoRef.current.pause();
          setIsVideoMode(false);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = syncTime;
              audioRef.current.play();
              setIsPlaying(true);
            }
          }, 100);
        }
      }
  }, [isVideoMode]);

  const handleNext = useCallback(() => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  }, [songs.length]);

  const handlePrevious = useCallback(() => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
  }, [songs.length]);


  const handleSongSelect = useCallback((index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
    setCurrentPage(Math.floor(currentSongIndex / SONGS_PER_PAGE));
    setIsVideoMode(false);
  }, [currentSongIndex]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.nativeEvent.offsetX;
    const width = rect.width;
    const progress = clickX / width;
    const newTime = progress * duration;

    if (isVideoMode && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  }, [duration, isVideoMode]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  if (!isLoggedIn) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff9a9e, #fad0c4)'
    }}>

      {/* 👇 POPUP - idha vaikkanum, return உள்ளே */}
      {passwordError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
          onClick={() => { setPasswordError(false); setPassword(''); }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "backOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              width: '340px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <span style={{ fontSize: '60px' }}>🚫</span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#7a1143', margin: 0, fontFamily: 'Playfair Display, serif' }}>
              Access Denied!
            </h2>
            <p style={{ fontSize: '16px', color: '#ff5f9e', margin: 0, fontWeight: 600, fontFamily: 'Playfair Display, serif', lineHeight: 1.5 }}>
              Sorry! 🙅‍♂️ You are not an authorized person to enter this special place! 💔
            </p>
            <p style={{ fontSize: '14px', color: '#999', margin: 0, fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
              This place is only for someone very special 🌹
            </p>
            <motion.button
              className="btn yes"
              onClick={() => { setPasswordError(false); setPassword(''); }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            >
              Try Again 💗
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* login card */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        width: '380px',
        height: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        boxShadow: '0 24px 48px rgba(122, 17, 67, 0.15)',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.img
          src={config.media.bubuGif}
          alt="cute bear"
          style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#7a1143', margin: 0, fontFamily: 'Playfair Display, serif' }}>
          Hey! Who's there? 🐻
        </h1>
        <p style={{ fontSize: '15px', color: '#ff5f9e', margin: 0, fontWeight: 600, fontFamily: 'Playfair Display, serif' }}>
          Enter the secret password 🔐
        </p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="password"
            style={{
              width: '100%',
              padding: '12px 20px',
              border: `2px solid ${passwordError ? '#ff0000' : '#ff7aa2'}`,
              borderRadius: '25px',
              fontSize: '15px',
              textAlign: 'center',
              outline: 'none',
              fontFamily: 'Playfair Display, serif',
              color: '#7a1143',
              boxSizing: 'border-box'
            }}
            placeholder="Enter password 💗"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <button
          className="btn yes"
          onClick={handleLogin}
          style={{ width: '100%', padding: '12px', fontSize: '16px' }}
        >
          Enter 💝
        </button>
      </div>
    </div>
  );
}
  

  if (view === "success") {
    return (
      <div className="valentine-root success">
        <div className="card success-card">
          <h1 className="yay">{config.content.successMessage}</h1>
          <p className="subtitle small">{config.content.successSubtitle}</p>

          <div className="image-card">
            <img
              src={config.media.loveYouBearGif}
              alt="cute gif"
              loading="lazy"
            />
          </div>

          <motion.div
            className="love-text-container"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              type: "spring",
              stiffness: 200,
            }}
          >
            <motion.h2
              className="love-text"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
                textShadow: [
                  "0 0 0 rgba(255, 192, 203, 0)",
                  "0 0 20px rgba(255, 192, 203, 0.8)",
                  "0 0 40px rgba(255, 192, 203, 1)",
                  "0 0 20px rgba(255, 192, 203, 0.8)",
                  "0 0 0 rgba(255, 192, 203, 0)",
                ],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                textShadow: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              I LOVE YOU❤️
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5, duration: 0.6 }}
  style={{ textAlign: "center", margin: "16px 0" }}
>
  <p style={{ 
    color: "#7a1143",
    WebkitTextFillColor: "#7a1143",
    fontFamily: "Playfair Display, serif", 
    fontSize: "16px", 
    fontWeight: 600, 
    marginBottom: "12px" 
  }}>
    💝 It's been this long since we last met...
  </p>
  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
    {[
      { value: timeElapsed.days, label: "Days" },
      { value: timeElapsed.hours, label: "Hours" },
      { value: timeElapsed.minutes, label: "Minutes" },
      { value: timeElapsed.seconds, label: "Seconds" },
    ].map(({ value, label }) => (
      <div key={label} style={{ 
        background: "linear-gradient(135deg, #ff9a9e, #fad0c4)", 
        borderRadius: "12px", 
        padding: "12px 16px", 
        minWidth: "70px", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        boxShadow: "0 4px 15px rgba(255, 122, 162, 0.3)" 
      }}>
        <span style={{ 
          fontSize: "28px", 
          fontWeight: 800, 
          color: "#7a1143",
          WebkitTextFillColor: "#7a1143",
          lineHeight: 1, 
          fontFamily: "Playfair Display, serif",
          display: "block"
        }}>
          {value}
        </span>
        <span style={{ 
          fontSize: "11px", 
          color: "#7a1143",
          WebkitTextFillColor: "#7a1143",
          fontWeight: 600, 
          marginTop: "4px", 
          textTransform: "uppercase", 
          fontFamily: "Playfair Display, serif",
          display: "block"
        }}>
          {label}
        </span>
      </div>
    ))}
  </div>
</motion.div>
            </motion.h2>
          </motion.div>

          <div style={{ height: 12 }} />
          <motion.button
            className="btn romantic-gift-btn"
            onClick={() => setView("gifts")}
            whileHover={{
              scale: 1.05,
              y: -3,
              boxShadow: "0 15px 30px rgba(255, 122, 162, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {config.navigation.backToGifts}
          </motion.button>
        </div>
      </div>
    );
  }

  if (view === "gifts") {
    return (
      <div className="valentine-root gifts">
        <div className="card gifts-card">
          <h1 className="yay">{config.content.giftsTitle}</h1>

          <div className="gifts-container">
            <div className="gift-card" onClick={handleGift1Click}>
              <h3 className="gift-title">Gift 1</h3>
              <div className="gift-image">
                <img src={config.gifts.gift1} alt="gift 1" loading="lazy" />
              </div>
            </div>

            <div className="gift-card" onClick={handleGift2Click}>
              <h3 className="gift-title">Gift 2</h3>
              <div className="gift-image">
                <img src={config.gifts.gift2} alt="gift 2" loading="lazy" />
              </div>
            </div>

            <div className="gift-card" onClick={handleGift3Click}>
              <h3 className="gift-title">Gift 3</h3>
              <div className="gift-image">
                <img src={config.gifts.gift3} alt="gift 3" loading="lazy" />
              </div>
            </div>
          </div>

          {allGiftsOpened ? (
            <div className="all-gifts-opened">
              <div className="love-you-bear-container">
                <img
                  src={config.media.loveYouBearGif}
                  alt="love you bear"
                  loading="lazy"
                />
              </div>
              <p className="all-gifts-text">
                Yayyyy!! You opened all the gifts! <br />
                LOVE YOU SO MUCH BABYYYYY!❤️
              </p>
            </div>
          ) : (
            <>
              <div style={{ height: 12 }} />
              <button className="btn yes" onClick={() => setView("success")}>
                {config.navigation.backToLove}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === "songs") {
    return (
      <div className="valentine-root songs">
        <div className="card songs-card">
          <h1 className="yay">{config.content.songsTitle}</h1>

          <div className="media-player-container">
            <motion.div
              className="media-player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Album Art Section */}
             <div className="album-art-section">
                <motion.div
                  className="album-art-frame"
                  whileHover={{ scale: isVideoMode ? 1 : 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Video player - always rendered but hidden in audio mode */}
                  {currentSong.video && (
                    <video
                      ref={videoRef}
                      src={currentSong.video}
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        objectFit: "cover",
                        visibility: isVideoMode ? "visible" : "hidden",
                        height: isVideoMode ? "300px" : "0px",
                        maxHeight: "300px",
                      }}
                      onTimeUpdate={() => {
                        if (isVideoMode && videoRef.current) {
                          setCurrentTime(videoRef.current.currentTime);
                        }
                      }}
                      onEnded={handleNext}
                    />
                  )}

                  {/* Album art - hidden in video mode */}
                  {!isVideoMode && (
                    <div className="album-art">
                      <img
                        src={currentSong.cover}
                        alt="Album Cover"
                        loading="lazy"
                        className="album-image"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Toggle Button */}
                {currentSong.video && (
                  <motion.button
                    onClick={handleVideoToggle}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      marginTop: "10px",
                      padding: "8px 20px",
                      borderRadius: "20px",
                      border: "none",
                      background: isVideoMode ? "#ff7aa2" : "#ffe0eb",
                      color: isVideoMode ? "white" : "#ff7aa2",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      margin: "10px auto 0 auto"
                    }}
                  >
                    {isVideoMode ? "🎵 Audio Mode" : "🎬 Watch Video"}
                  </motion.button>
                )}

                <div className="album-info">
                  <h2 className="album-title">{currentSong.album}</h2>
                  <p className="album-artist">{currentSong.artist}</p>
                </div>
              </div>

              {/* Media Controls Section */}
              <div className="media-controls">
                <div className="current-song-info">
                  <h3 className="current-title">{currentSong.title}</h3>
                  <p className="current-artist">{currentSong.artist}</p>
                </div>

                <div className="progress-section">
                  <div className="time-display">
                    <span className="current-time">
                      {formatTime(currentTime)}
                    </span>
                    <span className="duration">{formatTime(duration)}</span>
                  </div>
                  <div
                    className="progress-bar-container"
                    onClick={handleProgressClick}
                  >
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width:
                            duration > 0
                              ? `${(currentTime / duration) * 100}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="control-buttons">
                  <motion.button
                    className="control-btn"
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={config.tooltips.previous}
                  >
                    ⏪
                  </motion.button>

                  <motion.button
                    className="play-btn-large"
                    onClick={handlePlayPause}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={
                      isPlaying ? config.tooltips.pause : config.tooltips.play
                    }
                  >
                    {isPlaying ? "⏸️" : "▶️"}
                  </motion.button>

                  <motion.button
                    className="control-btn"
                    onClick={handleNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={config.tooltips.next}
                  >
                    ⏩
                  </motion.button>
                </div>

                <div className="volume-section">
                  <span className="volume-icon">
                    {volume > 0.5 ? "🔊" : volume > 0 ? "🔉" : "🔇"}
                  </span>
                  <div className="volume-bar-container">
                    <input
                      type="range"
                      className="volume-bar"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Song Playlist */}
           <div className="song-playlist">
            <h3 className="playlist-title">{config.content.songsTitle}</h3>
  
            {/* Paginated Songs */}
            <div className="playlist-container">
              {songs
                .slice(currentPage * SONGS_PER_PAGE, (currentPage + 1) * SONGS_PER_PAGE)
                .map((song, index) => {
                  const actualIndex = currentPage * SONGS_PER_PAGE + index;
                  return (
                    <motion.div
                      key={song.id}
                      className={`playlist-item ${actualIndex === currentSongIndex ? "active" : ""}`}
                      onClick={() => handleSongSelect(actualIndex)}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="playlist-item-left">
                        <div className="playlist-number">
                          {String(actualIndex + 1).padStart(2, "0")}
                        </div>
                        <div className="playlist-info">
                          <h4 className="playlist-title-text">{song.title}</h4>
                          <p className="playlist-artist">{song.artist}</p>
                        </div>
                      </div>
                      <div className="playlist-duration">{song.duration}</div>
                    </motion.div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
                {Array.from({ length: Math.ceil(songs.length / SONGS_PER_PAGE) }).map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "none",
                      background: currentPage === i ? "#ff7aa2" : "#ffe0eb",
                      color: currentPage === i ? "white" : "#ff7aa2",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={currentSong.audio}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            volume={volume}
          />

          <div style={{ height: 12 }} />
          <button className="btn yes" onClick={() => setView("gifts")}>
            {config.navigation.backToGifts}
          </button>
        </div>
      </div>
    );
  }

  // if (view === "snake") {
  //     return (
  //     <div className="valentine-root">
  //       <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
  //         <SnakeGame />
  //         <button 
  //           className="btn yes" 
  //           onClick={() => setView("gifts")}
  //           style={{ marginTop: 16, marginBottom: 24 }}
  //         >
  //           {config.navigation.backToGifts}
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (view === "games") {
  return (
    <div className="valentine-root">
      <div className="card games-card" style={{ textAlign: "center" }}>
        <h1 className="yay">🎮 Welcome to the Games Section 🎮</h1>
        <p className="subtitle small">
          Choose a game and let the fun begin 💕
        </p>

        <div style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          marginTop: "32px",
          flexWrap: "wrap"
        }}>
          
          {/* Snake Game Card */}
          <motion.div
            className="game-card"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedGame("snake");
              setView("playGame");
            }}
          >
            <img src={config.media.musicBearGif} alt="snake" width="120" />
            <h3>🐍 Snake Game</h3>
          </motion.div>

          {/* Catch Hearts Game Card */}
          <motion.div
            className="game-card"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedGame("catchHearts");
              setView("playGame");
            }}
          >
            <img src={config.media.loveYouBearGif} alt="hearts" width="120" />
            <h3>💖 Catch Hearts</h3>
          </motion.div>

        </div>

        <div style={{ marginTop: 32 }}>
          <button className="btn yes" onClick={() => setView("gifts")}>
            {config.navigation.backToGifts}
          </button>
        </div>
      </div>
    </div>
  );
}

if (view === "playGame") {
  return (
    <div className="valentine-root">
      <div style={{ textAlign: "center" }}>

        {selectedGame === "snake" && <SnakeGame />}

        {selectedGame === "catchHearts" && <CatchHearts />}

        <button
          className="btn yes"
          style={{ marginTop: 20 }}
          onClick={() => setView("games")}
        >
          ⬅ Back to Games
        </button>
      </div>
    </div>
  );
}

  if (view === "letter") {
    return (
      <div className="valentine-root letter">
        <div className="card letter-card">
          <h1 className="yay">{config.content.letterTitle}</h1>
          <motion.div
            className="envelope-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="envelope"
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="envelope-flap">
                <div className="envelope-triangle"></div>
              </div>
              <div className="envelope-body">
                <div className="envelope-seal">
                  <span className="heart-symbol">
                    {config.media.envelopeSeal}
                  </span>
                </div>
              </div>
            </motion.div>

            {envelopeOpen && (
              <motion.div
                className="letter-paper"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="letter-content">
                  <h2 className="letter-title">{config.letter.title}</h2>
                  {config.letter.content.map((paragraph, index) => (
                    <p key={index} className="letter-text">
                      {paragraph}
                    </p>
                  ))}
                  <p className="letter-signature">{config.letter.signature}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {envelopeOpen && <div style={{ height: 12 }} />}
          <button className="btn yes" onClick={() => setView("gifts")}>
            {config.navigation.backToGifts}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        className="valentine-root"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.div
          className="card"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          <motion.img
            src={config.media.mainBearGif}
            alt="cute bear"
            className="card-image"
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="name">{config.names.receiver.toUpperCase()},</span>
            <span className="ask"> {config.content.title}</span>
            <span className="hearts"> </span>
          </motion.h1>

          <motion.div
            className="choices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.button
              className="btn yes"
              onClick={() => setView("success")}
              whileHover={{
                scale: 1.1,
                y: -5,
                boxShadow: "0 12px 25px rgba(255, 122, 162, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {config.content.yesButtonText}
            </motion.button>
            <motion.button
              className="btn no"
              onMouseEnter={handleNoEnter}
              onMouseLeave={handleNoLeave}
              onClick={handleNoEnter}
              aria-label="No button"
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {noLabel}
            </motion.button>
          </motion.div>
        </motion.div>

        {showHoverPopup && (
          <motion.div
            className="overlay"
            onClick={closeHoverPopup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="popup"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "backOut" }}
            >
              <button
                className="close-btn"
                onClick={closeHoverPopup}
                aria-label="Close"
              >
                ✕
              </button>
              <p className="popup-text">
                Don’t worry, let me walk you through the perks… it might just change your mind 😉
              </p>
              <motion.button
                className="btn okay-btn"
                onClick={openProsConsPopup}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Okay
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showProsConsPopup && (
          <motion.div
            className="overlay"
            onClick={closeProsConsPopup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="pros-cons-popup"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "backOut" }}
            >
              <button
                className="close-btn"
                onClick={closeProsConsPopup}
                aria-label="Close"
              >
                ✕
              </button>

              <h2 className="pros-cons-title">
                {config.content.prosConsTitle}
              </h2>

              <motion.div
                className="cards-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div
                  className="card pros-card"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="card-title">💖 Pros</h3>
                  <div className="pros-list">
                    <div className="pro-item">
                      <img
                        src={slides[currentSlide].gif}
                        alt="pro"
                        className="pro-gif"
                        loading="lazy"
                      />
                      <p className="pro-text">{slides[currentSlide].text}</p>
                    </div>
                  </div>

                  <div className="pros-nav">
                    <motion.button
                      className="nav-btn"
                      onClick={prevSlide}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <img
                        src={config.media.leftButton}
                        alt="previous"
                        className="nav-btn-img"
                      />
                    </motion.button>
                    <span className="slide-indicator">
                      {currentSlide + 1} / {slides.length}
                    </span>
                    <motion.button
                      className="nav-btn"
                      onClick={nextSlide}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <img
                        src={config.media.rightButton}
                        alt="next"
                        className="nav-btn-img"
                      />
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className="card cons-card"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="card-title">❌ Cons</h3>
                  <div className="cons-content">
                    <img
                      src={config.media.childGif}
                      alt="child"
                      className="cons-gif"
                      loading="lazy"
                    />
                    <p className="cons-text">
                      {config.content.prosConsSubtitle}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
