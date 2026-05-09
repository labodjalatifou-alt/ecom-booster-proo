"use client";

export function useShopifySound() {
  const playKaching = () => {
    const audio = new Audio('/sounds/shopify-notif.mp3');
    audio.play().catch(e => console.error("Erreur lecture son:", e));
  };

  return { playKaching };
}
