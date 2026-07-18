"use client";

import { useRef, useEffect, useCallback } from 'react';

export type SoundType = 'order' | 'confirm' | 'deliver' | 'cash';

export function useAppSounds() {
  const soundsRef = useRef<Record<SoundType, HTMLAudioElement | null>>({
    order: null,
    confirm: null,
    deliver: null,
    cash: null
  });

  useEffect(() => {
    // Préchargement des sons avec version pour forcer le rafraîchissement du cache
    soundsRef.current.order = new Audio('/sounds/shopify-notif.mp3?v=1');
    soundsRef.current.confirm = new Audio('/sounds/phone-hangup.mp3?v=1');
    soundsRef.current.deliver = new Audio('/sounds/klaxon.mp3?v=2');
    soundsRef.current.cash = new Audio('/sounds/coins.mp3?v=1');

    // Configuration par défaut et volume
    Object.values(soundsRef.current).forEach(audio => {
      if (audio) {
        audio.volume = 1.0;
        audio.load();
      }
    });

    // Fonction d'interaction utilisateur unique pour "débloquer" les sons dans le navigateur
    const unlockAudioContext = () => {
      console.log("[Audio] Interaction détectée, déblocage des contextes audio...");
      Object.values(soundsRef.current).forEach(audio => {
        if (audio) {
          // Joue brièvement et met en pause pour autoriser la lecture future en arrière-plan
          audio.play()
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
            })
            .catch(() => {});
        }
      });
      // Nettoyer les écouteurs d'événements après le premier clic
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
    };

    document.addEventListener('click', unlockAudioContext);
    document.addEventListener('touchstart', unlockAudioContext);

    return () => {
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const audio = soundsRef.current[type];
    if (audio) {
      console.log(`[Audio] Tentative de lecture du son : ${type}`);
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn(`[Audio] Lecture bloquée pour ${type}. Veuillez cliquer sur l'application pour activer les sons.`, e);
      });
    }
  }, []);

  return { 
    playSound,
    playKaching: useCallback(() => playSound('order'), [playSound])
  };
}
