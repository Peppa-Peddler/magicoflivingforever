'use client';

import { useState, useEffect, useRef } from 'react';
import DataDisplay from './DataDisplay';
import AudioPlayer from './AudioPlayer';

interface ImageData {
  id: number;
  src: string;
  duration: number; // brightness→normal phase in seconds
}

const ImageViewer = ({ images }: { images: ImageData[] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [elapsedInImage, setElapsedInImage] = useState(0);
  const [brightness, setBrightness] = useState(100);

  const NORMAL_TO_BLACK_DURATION = 20; // Fixed 20s for normal→black transition
  const TOTAL_CYCLE_SECONDS = 30 * 60; // 30 minutes = 1800 seconds

  // Calculate which image should be playing based on current time
  useEffect(() => {
    const calculateImageAndProgress = () => {
      const now = new Date();
      const secondsSinceMidnight =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds() +
        now.getMilliseconds() / 1000;

      // Get position within the 30-minute cycle
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
  const createSeededRandom = (seed: string): (() => number) => {
    let x = Math.sin(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) * 10000;
    x = x - Math.floor(x);
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  };
  
  const seededRandom = createSeededRandom(dateString);
  
  // Calculate solar/time data based on elapsed time in the 30-minute cycle
  const hoursInDay = (elapsedInImage / TOTAL_CYCLE_SECONDS) * 24;
  const sunriseTime = 6; // 6 AM
  const sunsetTime = 18; // 6 PM
  const goldenHourStart = sunsetTime - 1; // 5 PM
  const goldenHourEnd = sunsetTime; // 6 PM
  const blueHourStart = sunsetTime; // 6 PM
  const blueHourEnd = sunsetTime + 1; // 7 PM
  
  // Calculate solar altitude (angle above horizon, -90 to 90)
  const solarAltitude = Math.sin((hoursInDay - 6) / 12 * Math.PI) * 90;
  
  // Calculate solar azimuth (compass direction, 0-360°)
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
  
  // Ghost Detector based on image index
  const ghostDetectors = [
    'MUC v1.01 I',
    'MUC v2.03 II',
    'MUC v3.04 III',
    'MUC v4.05 IV'
  ];
  const ghostDetectorIndex = currentImageIndex % ghostDetectors.length;
  const ghostDetector = ghostDetectors[ghostDetectorIndex];

  const progressPercentage = (progress).toFixed(1);

  return (
    <div className="w-screen flex flex-col relative" style={{ height: 'auto' }}>
      {/* Two Column Layout - Left Column and Images */}
      <div style={{ display: 'flex', width: '100%' }}>
        {/* Left Column - Controls and Visualizations */}
        <div
          style={{
            width: '10%',
            backgroundColor: '#001aff',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '24px',
            overflowY: 'auto',
          }}
        >
          {/* Exposition Time */}
          <div
            style={{
              color: '#ffffff',
              fontSize: '14px',
            }}
          >
            Exposition <br/> {totalMinutes} min <br/>
            {Math.floor(elapsedInImage)}s / {totalSeconds}s  - {progressPercentage}%
          </div>

          {/* Audio Player Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <AudioPlayer compact={true} />
          </div>

          {/* Color Spectrum Graph - Light Entering */}
          <div style={{ marginTop: '16px' }}>
            <svg width="100%" height="120" viewBox="0 0 100 120" style={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <defs>
                <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgb(255,0,0)', stopOpacity: 1 }} />
                  <stop offset="16%" style={{ stopColor: 'rgb(255,255,0)', stopOpacity: 1 }} />
                  <stop offset="33%" style={{ stopColor: 'rgb(0,255,0)', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: 'rgb(0,255,255)', stopOpacity: 1 }} />
                  <stop offset="66%" style={{ stopColor: 'rgb(0,0,255)', stopOpacity: 1 }} />
                  <stop offset="83%" style={{ stopColor: 'rgb(255,0,255)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(255,0,0)', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Animated light beam showing progress */}
              <rect x="0" y="10" width={`${progress}%`} height="20" fill="url(#spectrum)" opacity="0.8" />
              {/* Spectrum bar background */}
              <rect x="0" y="40" width="100" height="15" fill="url(#spectrum)" opacity="0.5" />
              {/* Progress label */}
              <text x="50" y="85" textAnchor="middle" fontSize="8" fill="#78716c">
                Light spectrum
              </text>
            </svg>
          </div>

          {/* Brightness Value Graph - Descending */}
          <div style={{ marginTop: '16px' }}>
            <svg width="100%" height="120" viewBox="0 0 100 120" style={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              {/* Grid lines */}
              <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
              
              {/* Brightness descending line */}
              <line
                x1="0"
                y1={100 - (brightness + 100) / 2}
                x2="100"
                y2="100"
                stroke="#000000"
                strokeWidth="1.5"
              />
              
              {/* Current brightness indicator */}
              <circle
                cx={progress}
                cy={100 - (brightness + 100) / 2}
                r="1.5"
                fill="#000000"
              />
              
              {/* Brightness label */}
              <text x="50" y="115" textAnchor="middle" fontSize="8" fill="#78716c">
                Brightness: {brightness.toFixed(0)}%
              </text>
            </svg>
          </div>
        </div>

        {/* Right Column - Images Only */}
        <div style={{ width: '90%', display: 'flex', flexDirection: 'column' }}>
          {/* Top Half: Positive Image - 25:6 aspect ratio */}
          <div
            className="relative flex items-center justify-center overflow-hidden bg-white"
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
          <div style={{ width: '100%', height: '1px', backgroundColor: '#d1d5db' }} />

          {/* Bottom Half: Negative Image - 25:6 aspect ratio */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
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
        </div>
      </div>

      {/* Data Display Component - Below Both Columns */}
      <DataDisplay />
    </div>
  );
};

export default ImageViewer;
