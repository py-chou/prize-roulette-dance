import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { usePixiApp } from '@/hooks/usePixiApp';

interface PixiBackgroundProps {
  isSpinning: boolean;
  width?: number;
  height?: number;
}

export const PixiBackground = ({
  isSpinning,
  width,
  height,
}: PixiBackgroundProps) => {
  const glowRef = useRef<PIXI.Graphics | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Only create PixiJS app when spinning
  const { containerRef: pixiContainerRef, app } = usePixiApp({
    width: width || (typeof window !== 'undefined' ? window.innerWidth : 800),
    height: height || (typeof window !== 'undefined' ? window.innerHeight : 600),
    backgroundColor: 'transparent',
    antialias: true,
  });

  // Create glow effect
  useEffect(() => {
    if (!app || !isSpinning) return;

    const glow = new PIXI.Graphics();
    app.stage.addChild(glow);
    glowRef.current = glow;

    return () => {
      if (glowRef.current) {
        glowRef.current.destroy();
        glowRef.current = null;
      }
    };
  }, [app, isSpinning]);

  // Animate glow
  useEffect(() => {
    if (!app || !isSpinning) {
      // Clear animation when not spinning
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (glowRef.current) {
        glowRef.current.clear();
      }
      return;
    }

    if (!glowRef.current) return;

    const animate = () => {
      if (!glowRef.current || !isSpinning) return;

      timeRef.current += 0.02;

      const scale = 1 + Math.sin(timeRef.current) * 0.2;
      const opacity = 0.5 + Math.sin(timeRef.current) * 0.5;

      glowRef.current.clear();
      glowRef.current.beginFill(0xffd700, opacity * 0.15);
      glowRef.current.drawCircle(
        app.screen.width / 2,
        app.screen.height / 2,
        Math.min(app.screen.width, app.screen.height) * 0.5 * scale
      );
      glowRef.current.endFill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [app, isSpinning]);

  // Don't render if not spinning
  if (!isSpinning) return null;

  return (
    <div
      ref={pixiContainerRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

