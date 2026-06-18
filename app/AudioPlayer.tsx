'use client';

import { useState, useRef } from 'react';

interface AudioPlayerProps {
  compact?: boolean;
}

const AudioPlayer = ({ compact = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/output.mp3');
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        console.log('Audio play failed');
      });
      setIsPlaying(true);
    }
  };

  if (compact) {
    // Compact version for bottom bar
    return (
      <button
        onClick={handleToggle}
        style={{
          padding: '10px 14px',
          backgroundColor: '#000000',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#333333';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000000';
        }}
        title={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? (
          // Muted icon (when playing, click to pause/mute)
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          // Unmuted icon (when paused, click to play/unmute)
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a6.5 6.5 0 0 1 0 9.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        )}
      </button>
    );
  }

  // Full version (not used currently, but kept for flexibility)
  return null;
};

export default AudioPlayer;
