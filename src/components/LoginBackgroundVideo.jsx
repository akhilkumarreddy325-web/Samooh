import React, { useState, useRef, useEffect } from 'react';

/**
 * LoginBackgroundVideo Component
 * 
 * Renders a cinematic, realistic 1080p documentary video showing the authentic
 * Indian wholesale-to-kirana commerce ecosystem:
 * - Kirana stores opening at dawn
 * - Wholesale mandi warehouses & grain sacks
 * - Tata Ace neighborhood delivery logistics
 * - Retailers weighing and organizing provisions
 * 
 * Features:
 * - Autoplays muted, loops seamlessly, playsInline.
 * - Non-blocking: Uses faststart metadata streaming.
 * - Fallback poster: High-res cinematic documentary still if video is loading/offline or on low-power devices.
 * - Warm, subtle dark overlay for crystal-clear foreground text contrast.
 * - pointer-events-none so it never intercepts user clicks or inputs.
 */
export default function LoginBackgroundVideo() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt play on mount (muted is required for browser autoplay policies)
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoLoaded(true);
          })
          .catch((err) => {
            // Autoplay blocked by browser power-saving or low data mode
            console.info('[Samooh Video] Autoplay paused by client policy, showing poster:', err.message);
            setVideoLoaded(false);
          });
      }
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* 1. High-Resolution Cinematic Poster Fallback (Always rendered underneath) */}
      <img
        src="/images/kirana_store_dawn.jpg"
        alt="Samooh Commerce Documentary"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        loading="eager"
      />

      {/* 2. Seamless 1080p Video Stream */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/kirana_store_dawn.jpg"
          onCanPlayThrough={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/videos/samooh_documentary_web.mp4" type="video/mp4" />
          <source src="/videos/samooh_documentary_loop.mp4" type="video/mp4" />
        </video>
      )}

      {/* 3. Subtle Warm Charcoal & Earthy Amber Contrast Overlay */}
      {/* Provides optimal contrast for the white login card without dulling the footage */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/60 to-slate-950/75 mix-blend-multiply" 
      />
      <div 
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" 
      />
    </div>
  );
}
