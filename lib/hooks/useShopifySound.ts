"use client";

import { useRef, useEffect } from 'react';

export function useShopifySound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/shopify-notif.mp3');
    audioRef.current.load();
  }, []);

  const playKaching = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.warn("Autoplay blocked or audio error:", e);
        // Fallback: toast already shown, audio needs user interaction
      });
    }
  };

  return { playKaching };
}
