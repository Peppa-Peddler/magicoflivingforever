'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageData {
  id: number;
  src: string;
  duration: number; // brightness→normal phase in seconds
}

const ImageViewer = ({ images }: { images: ImageData[] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [elapsedInImage, setElapsedInImage] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const NORMAL_TO_BLACK_DURATION = 20; // Fixed 20s for normal→black transition
  const TOTAL_CYCLE_SECONDS = 2 * 60 * 60; // 2 hours = 7200 seconds

  // Calculate which image should be playing based on current time
  useEffect(() => {
    const calculateImageAndProgress = () => {
      const now = new Date();
      const secondsSinceMidnight =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds() +
        now.getMilliseconds() / 1000;

      // Get position within the 2-hour cycle
      const cyclePosition = secondsSinceMidnight % TOTAL_CYCLE_SECONDS;

      // Calculate cumulative time to find current image
      let cumulativeTime = 0;
      let foundImageIndex = 0;
      let elapsedInCurrentImage = cyclePosition;

      for (let i = 0; i < images.length; i++) {
        const imageTotalDuration = images[i].duration + NORMAL_TO_BLACK_DURATION;

        if (cyclePosition < cumulativeTime + imageTotalDuration) {
          foundImageIndex = i;
          elapsedInCurrentImage = cyclePosition - cumulativeTime;
          break;
        }

        cumulativeTime += imageTotalDuration;
      }

      setCurrentImageIndex(foundImageIndex);
      setElapsedInImage(elapsedInCurrentImage);

      // Calculate brightness based on phase
      const currentImage = images[foundImageIndex];
      let brightnessValue = 100;

      if (elapsedInCurrentImage < currentImage.duration) {
        // Phase 1: brightness→normal (white to normal brightness)
        const progress = elapsedInCurrentImage / currentImage.duration;
        brightnessValue = 100 + (0 - 100) * progress; // 100% → 0%
      } else {
        // Phase 2: normal→black (20 seconds)
        const timeSincePhase2 =
          elapsedInCurrentImage - currentImage.duration;
        if (timeSincePhase2 < NORMAL_TO_BLACK_DURATION) {
          const progress = timeSincePhase2 / NORMAL_TO_BLACK_DURATION;
          brightnessValue = 0 - 100 * progress; // 0% → -100%
        } else {
          // Stay black
          brightnessValue = -100;
        }
      }

      setBrightness(brightnessValue);
    };

    calculateImageAndProgress();
    const interval = setInterval(calculateImageAndProgress, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images[currentImageIndex];
  const totalImageDuration =
    currentImage.duration + NORMAL_TO_BLACK_DURATION;
  const progress = (elapsedInImage / totalImageDuration) * 100;

  // Build filter strings and image opacity
  // Positive: Phase 1 (pure white→normal) then Phase 2 (normal→inverted black)
  // Negative: Always inverted version of positive
  // Image opacity: 0 at start, increases to 100% over 1/3 of elapsed time
  
  let positiveFilter = '';
  let negativeFilter = '';
  let imageOpacity = 0; // Image fades in over 1/3 of duration
  
  // Calculate image opacity based on elapsed time (0 to 100% over 1/3 of image duration)
  const opacityDuration = currentImage.duration / 3; // 1/3 of the image's variable duration
  if (elapsedInImage < opacityDuration) {
    // Fade in the image over 1/3 of the image duration
    imageOpacity = (elapsedInImage / opacityDuration) * 100;
  } else {
    // Image stays at 100% for the rest of the image
    imageOpacity = 100;
  }
  
  if (brightness >= 0) {
    // Phase 1: pure white to normal
    // brightness = 100% → brightness(6) [pure white]
    // brightness = 0% → brightness(1) [normal]
    const brightnessValue = 1 + (brightness / 20); // 6 at 100%, 1 at 0%
    positiveFilter = `brightness(${brightnessValue})`;
    // Negative: apply brightness THEN invert
    negativeFilter = `brightness(${brightnessValue}) invert(1)`;
  } else {
    // Phase 2: normal to inverted black
    // brightness = 0% → brightness(1) invert(0) [normal]
    // brightness = -100% → brightness(0.1) invert(1) [inverted/black]
    const invertAmount = Math.abs(brightness) / 100; // 0 to 1
    const darkBrightness = 1 - (invertAmount * 0.9); // Goes to 0.1 at -100%
    positiveFilter = `brightness(${darkBrightness}) invert(${invertAmount})`;
    // Negative: inverse invert amount, same brightness
    const negativeInvertAmount = 1 - invertAmount;
    negativeFilter = `brightness(${darkBrightness}) invert(${negativeInvertAmount})`;
  }

  const handleAudioToggle = () => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio('/output.mp3');
    }
    
    if (isAudioPlaying) {
      audioElementRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioElementRef.current.play().catch(() => {
        console.log('Audio play failed');
      });
      setIsAudioPlaying(true);
    }
  };

  // Format elapsed time
  const elapsedMinutes = Math.floor(elapsedInImage / 60);
  const elapsedSeconds = Math.floor(elapsedInImage % 60);
  const timeString = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
  
  // Total time in seconds and minutes
  const totalSeconds = Math.floor(totalImageDuration);
  const totalMinutes = Math.floor(totalImageDuration / 60);
  
  // Get current date for seeding
  const now = new Date();
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Create a seed based on the date (so all data depends only on the clock, not the date)
  // This ensures the same data throughout the day
  const createSeededRandom = (seed: string): (() => number) => {
    let x = Math.sin(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) * 10000;
    x = x - Math.floor(x);
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  };
  
  const seededRandom = createSeededRandom(dateString);
  
  // Calculate solar/time data based on elapsed time in the 2-hour cycle
  // Assume the cycle represents a full day (0-2 hours = 0-24 hours)
  const hoursInDay = (elapsedInImage / TOTAL_CYCLE_SECONDS) * 24;
  const sunriseTime = 6; // 6 AM
  const sunsetTime = 18; // 6 PM
  const goldenHourStart = sunsetTime - 1; // 5 PM
  const goldenHourEnd = sunsetTime; // 6 PM
  const blueHourStart = sunsetTime; // 6 PM
  const blueHourEnd = sunsetTime + 1; // 7 PM
  
  // Determine sunrise/sunset status
  let sunStatus = 'Night';
  if (hoursInDay >= sunriseTime && hoursInDay < sunsetTime) {
    sunStatus = 'Day';
  } else if (hoursInDay >= goldenHourStart && hoursInDay < goldenHourEnd) {
    sunStatus = 'Golden Hour';
  } else if (hoursInDay >= blueHourStart && hoursInDay < blueHourEnd) {
    sunStatus = 'Blue Hour';
  }
  
  // Calculate solar altitude (angle above horizon, -90 to 90)
  // Peaks at 90° at noon, -90° at midnight
  const solarAltitude = Math.sin((hoursInDay - 6) / 12 * Math.PI) * 90;
  
  // Calculate solar azimuth (compass direction, 0-360°)
  // 0° = North, 90° = East, 180° = South, 270° = West
  const solarAzimuth = ((hoursInDay - 6) / 24) * 360;
  
  // Format sunrise/sunset times
  const sunriseFormatted = `${sunriseTime}:00 AM`;
  const sunsetFormatted = `${sunsetTime}:00 PM`;
  
  // Format golden and blue hours
  const goldenHourFormatted = `${Math.floor(goldenHourStart)}:00 PM - ${Math.floor(goldenHourEnd)}:00 PM`;
  const blueHourFormatted = `${Math.floor(blueHourStart)}:00 PM - ${Math.floor(blueHourEnd)}:00 PM`;
  
  // Latitude and Longitude (Lima, Peru)
  const latitude = '-12.05165965';
  const longitude = '-77.0346048270753';
  
  // Ghost Detector based on image index (seeded, so same for each image every day)
  const ghostDetectors = [
    'MUC v1.01 I',
    'MUC v2.03 II',
    'MUC v3.04 III',
    'MUC v4.05 IV'
  ];
  const ghostDetectorIndex = currentImageIndex % ghostDetectors.length;
  const ghostDetector = ghostDetectors[ghostDetectorIndex];

  return (
    <div className="w-screen flex flex-col overflow-hidden relative">
      {/* Top Half: Positive Image - 25:6 aspect ratio */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden bg-white"
        style={{ aspectRatio: '25 / 6' }}
      >
        <img
          src={currentImage.src}
          alt={`Image ${currentImage.id}`}
          className="h-full w-full object-cover animate-vibrate"
          style={{
            filter: positiveFilter,
            opacity: imageOpacity / 100,
          }}
        />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-800" />

      {/* Bottom Half: Negative Image - 25:6 aspect ratio */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: '25 / 6', backgroundColor: '#000000' }}
      >
        <img
          src={currentImage.src}
          alt={`Negative ${currentImage.id}`}
          className="h-full w-full object-cover animate-vibrate"
          style={{
            filter: negativeFilter,
            opacity: imageOpacity / 100,
          }}
        />
      </div>

      {/* Info Section Below Images */}
      <div className="w-full px-4 py-4 bg-white">
        {/* Top Row: Exposition Time and Audio Button */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: Exposition Time */}
          <div>
            Exposition time: {Math.floor(elapsedInImage)}s / {totalSeconds}s ({totalMinutes} min)
          </div>

          {/* Right: Audio Button (Sound Icon) */}
          <button
            onClick={handleAudioToggle}
            style={{
              padding: '8px 12px',
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
            title={isAudioPlaying ? 'Stop audio' : 'Play audio'}
          >
            {isAudioPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a6.5 6.5 0 0 1 0 9.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a6.5 6.5 0 0 1 0 9.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Bottom Row: Data Grid - Each item in its own column */}
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
          {/* Sunrise */}
          <div>
            <div>Sunrise</div>
            <div>{sunriseFormatted}</div>
          </div>

          {/* Sunset */}
          <div>
            <div>Sunset</div>
            <div>{sunsetFormatted}</div>
          </div>

          {/* Solar Altitude */}
          <div>
            <div>Solar Alt.</div>
            <div>{solarAltitude.toFixed(1)}°</div>
          </div>

          {/* Solar Azimuth */}
          <div>
            <div>Solar Az.</div>
            <div>{solarAzimuth.toFixed(1)}°</div>
          </div>

          {/* Golden Hour */}
          <div>
            <div>Golden Hr</div>
            <div>{goldenHourFormatted}</div>
          </div>

          {/* Blue Hour */}
          <div>
            <div>Blue Hr</div>
            <div>{blueHourFormatted}</div>
          </div>

          {/* Latitude */}
          <div>
            <div>Latitude</div>
            <div>{latitude}</div>
          </div>

          {/* Longitude */}
          <div>
            <div>Longitude</div>
            <div>{longitude}</div>
          </div>

          {/* Ghost Detector */}
          <div>
            <div>Ghost Det.</div>
            <div>{ghostDetector}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
