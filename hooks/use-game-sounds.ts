import { useRef, useCallback } from 'react';

type SoundEffect = 'move' | 'rotate' | 'drop' | 'clear' | 'levelup' | 'gameover';

const SOUND_URLS: Record<SoundEffect, string> = {
  move: '/sounds/move.mp3',
  rotate: '/sounds/rotate.mp3',
  drop: '/sounds/drop.mp3',
  clear: '/sounds/clear.mp3',
  levelup: '/sounds/levelup.mp3',
  gameover: '/sounds/gameover.mp3',
};

export function useGameSounds(enabled: boolean = true) {
  const audioRefs = useRef<Record<SoundEffect, HTMLAudioElement>>({} as Record<SoundEffect, HTMLAudioElement>);

  // Initialize audio elements
  const initializeAudio = useCallback(() => {
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRefs.current[key as SoundEffect] = audio;
    });
  }, []);

  // Play a sound effect
  const playSound = useCallback((effect: SoundEffect) => {
    if (!enabled) return;

    const audio = audioRefs.current[effect];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.warn(`Failed to play sound effect: ${effect}`, error);
      });
    }
  }, [enabled]);

  return {
    initializeAudio,
    playSound,
  };
}