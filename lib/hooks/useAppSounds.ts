"use client";

import { useRef, useEffect } from 'react';

export type SoundType = 'order' | 'confirm' | 'deliver' | 'cash';

export function useAppSounds() {
  const soundsRef = useRef<Record<SoundType, HTMLAudioElement | null>>({
    order: null,
    confirm: null,
    deliver: null,
    cash: null
  });

  useEffect(() => {
    // Préchargement des sons
    soundsRef.current.order = new Audio('/sounds/shopify-notif.mp3');
    soundsRef.current.confirm = new Audio('/sounds/phone-hangup.mp3');
    soundsRef.current.deliver = new Audio('/sounds/klaxon.mp3');
    soundsRef.current.cash = new Audio('/sounds/coins.mp3');

    // Configuration par défaut
    Object.values(soundsRef.current).forEach(audio => {
      if (audio) {
        audio.volume = 0.7;
        audio.load();
      }
    });
  }, []);

  const playSound = (type: SoundType) => {
    const audio = soundsRef.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn(`[Audio] Autoplay blocked or error for ${type}:`, e);
      });
    }
  };

  return { 
    playSound,
    // Pour compatibilité avec l'existant pendant la transition
    playKaching: () => playSound('order')
  };
}
