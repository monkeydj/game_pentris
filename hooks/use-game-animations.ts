import { useRef, useCallback } from 'react';

interface AnimationState {
  lineClear: {
    lines: number[];
    progress: number;
    active: boolean;
  };
  levelUp: {
    active: boolean;
    progress: number;
  };
}

export function useGameAnimations(ctx: CanvasRenderingContext2D | null) {
  const animationState = useRef<AnimationState>({
    lineClear: {
      lines: [],
      progress: 0,
      active: false
    },
    levelUp: {
      active: false,
      progress: 0
    }
  });

  const animateLineClear = useCallback((lines: number[]) => {
    if (!ctx) return;
    
    animationState.current.lineClear = {
      lines,
      progress: 0,
      active: true
    };
    
    return new Promise<void>(resolve => {
      const animate = () => {
        const { progress, active } = animationState.current.lineClear;
        if (!active || progress >= 1) {
          animationState.current.lineClear.active = false;
          resolve();
          return;
        }

        // Flash effect
        const alpha = Math.abs(Math.sin(progress * Math.PI * 4));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        
        lines.forEach(line => {
          ctx.fillRect(0, line * 30, ctx.canvas.width, 30);
        });

        animationState.current.lineClear.progress += 0.05;
        requestAnimationFrame(animate);
      };

      animate();
    });
  }, [ctx]);

  const animateLevelUp = useCallback(() => {
    if (!ctx) return;

    animationState.current.levelUp = {
      active: true,
      progress: 0
    };

    return new Promise<void>(resolve => {
      const animate = () => {
        const { progress, active } = animationState.current.levelUp;
        if (!active || progress >= 1) {
          animationState.current.levelUp.active = false;
          resolve();
          return;
        }

        // Scale and fade effect for "LEVEL UP!"
        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.font = '48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const scale = 1 + progress * 0.5;
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.fillText('LEVEL UP!', 0, 0);
        ctx.restore();

        animationState.current.levelUp.progress += 0.02;
        requestAnimationFrame(animate);
      };

      animate();
    });
  }, [ctx]);

  return {
    animateLineClear,
    animateLevelUp,
    isAnimating: () => 
      animationState.current.lineClear.active || 
      animationState.current.levelUp.active
  };
}