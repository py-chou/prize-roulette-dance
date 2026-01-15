import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';

interface PixiProgressCircleProps {
  size?: number;
  strokeWidth?: number;
  isVisible?: boolean;
}

export const PixiProgressCircle = ({
  size = 160,
  strokeWidth = 8,
  isVisible = true,
}: PixiProgressCircleProps) => {
  const { containerRef, app } = usePixiApp({
    width: size,
    height: size,
    backgroundColor: 'transparent',
  });

  const backgroundCircleRef = useRef<PIXI.Graphics | null>(null);
  const progressCircleRef = useRef<PIXI.Graphics | null>(null);
  const containerRef2 = useRef<PIXI.Container | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);

  // HSL to RGB conversion helper
  const hslToRgb = (h: number, s: number, l: number): number => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return (r << 16) | (g << 8) | b;
  };

  // Simplified easing functions that approximate the cubic-bezier curves
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const easeInCubic = (t: number): number => {
    return t * t * t;
  };

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const getProgress = (elapsed: number): number => {
    const totalDuration = 2000; // 2 seconds
    
    // Ensure we reach exactly 1.0 when time is up
    if (elapsed >= totalDuration) {
      return 1.0;
    }
    
    const normalizedTime = Math.min(elapsed / totalDuration, 1);

    // 4 stages: 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1
    // Approximate the easing curves from framer-motion
    if (normalizedTime <= 0.25) {
      // Stage 1: [0.4, 0, 0.2, 1] - Slow start, fast end
      const t = normalizedTime / 0.25;
      const eased = easeOutCubic(t); // Approximate fast acceleration
      return Math.min(eased * 0.25, 0.25);
    } else if (normalizedTime <= 0.5) {
      // Stage 2: [0.2, 0, 0.4, 1] - Medium acceleration
      const t = (normalizedTime - 0.25) / 0.25;
      const eased = easeOutCubic(t);
      return Math.min(0.25 + eased * 0.25, 0.5);
    } else if (normalizedTime <= 0.75) {
      // Stage 3: [0.1, 0, 0.3, 1] - Fast acceleration
      const t = (normalizedTime - 0.5) / 0.25;
      const eased = easeOutCubic(t);
      return Math.min(0.5 + eased * 0.25, 0.75);
    } else {
      // Stage 4: [0, 0, 0.2, 1] - Very fast
      const t = Math.min((normalizedTime - 0.75) / 0.25, 1);
      const eased = easeOutCubic(t);
      return Math.min(0.75 + eased * 0.25, 1.0);
    }
  };

  // Get gradient color at progress
  const getGradientColor = (progress: number): number => {
    // Gradient: hsl(45 100% 50%) -> hsl(30 100% 55%) -> hsl(45 100% 50%)
    if (progress <= 0.5) {
      // First half: 45 -> 30
      const t = progress * 2;
      const h = 45 - (45 - 30) * t;
      const l = 50 + (55 - 50) * t;
      return hslToRgb(h, 100, l);
    } else {
      // Second half: 30 -> 45
      const t = (progress - 0.5) * 2;
      const h = 30 + (45 - 30) * t;
      const l = 55 - (55 - 50) * t;
      return hslToRgb(h, 100, l);
    }
  };

  // Create graphics
  useEffect(() => {
    if (!app || !isVisible) {
      // Clear refs when not visible
      if (containerRef2.current && app && app.stage) {
        if (containerRef2.current.parent === app.stage) {
          app.stage.removeChild(containerRef2.current);
        }
        containerRef2.current.destroy({ children: true });
        containerRef2.current = null;
      }
      backgroundCircleRef.current = null;
      progressCircleRef.current = null;
      return;
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - strokeWidth) / 2;

    // Create container
    const container = new PIXI.Container();
    container.x = centerX;
    container.y = centerY;
    app.stage.addChild(container);
    containerRef2.current = container;

    // Background circle
    const bgCircle = new PIXI.Graphics();
    bgCircle.lineStyle(strokeWidth, hslToRgb(45, 100, 50), 0.2);
    bgCircle.arc(0, 0, radius, 0, Math.PI * 2);
    bgCircle.stroke();
    container.addChild(bgCircle);
    backgroundCircleRef.current = bgCircle;

    // Progress circle
    const progressCircle = new PIXI.Graphics();
    container.addChild(progressCircle);
    progressCircleRef.current = progressCircle;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (containerRef2.current && app && app.stage) {
        // Check if container is still a child of the stage before removing
        if (containerRef2.current.parent === app.stage) {
          app.stage.removeChild(containerRef2.current);
        }
        containerRef2.current.destroy({ children: true });
        containerRef2.current = null;
      }
      backgroundCircleRef.current = null;
      progressCircleRef.current = null;
    };
  }, [app, isVisible, size, strokeWidth]);

  // Animate progress
  useEffect(() => {
    if (!app || !isVisible || !progressCircleRef.current || !containerRef2.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear progress when not visible
      if (progressCircleRef.current) {
        progressCircleRef.current.clear();
      }
      return;
    }

    const centerX = 0;
    const centerY = 0;
    const radius = (size - strokeWidth) / 2;

    // Clear any existing progress first
    if (progressCircleRef.current) {
      progressCircleRef.current.clear();
    }

    // Reset animation - ensure it always starts from 0
    startTimeRef.current = Date.now();
    progressRef.current = 0;

    const animate = () => {
      if (!progressCircleRef.current || !startTimeRef.current || !containerRef2.current) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const progress = getProgress(elapsed);
      progressRef.current = progress;

      // Clear and redraw progress arc
      progressCircleRef.current.clear();

      if (progress > 0) {
        // Draw arc from -90 degrees (top) clockwise
        const startAngle = -Math.PI / 2; // -90 degrees (top)
        // Ensure we draw full circle when progress >= 1
        const actualProgress = Math.min(progress, 1);
        const endAngle = startAngle + Math.PI * 2 * actualProgress;

        // Draw arc segments with gradient approximation
        const segments = Math.max(32, Math.ceil(actualProgress * 64)); // More segments for smoother gradient
        for (let i = 0; i < segments; i++) {
          const segmentStart = startAngle + (endAngle - startAngle) * (i / segments);
          const segmentEnd = startAngle + (endAngle - startAngle) * ((i + 1) / segments);
          
          if (segmentEnd <= segmentStart) continue;

          // Calculate color based on position along the arc
          const segmentProgress = i / segments;
          const segmentColor = getGradientColor(actualProgress * segmentProgress);
          
          progressCircleRef.current.lineStyle(strokeWidth, segmentColor, 1);
          progressCircleRef.current.arc(centerX, centerY, radius, segmentStart, segmentEnd);
          progressCircleRef.current.stroke();
        }

        // Draw rounded cap at the end
        if (actualProgress < 1) {
          const endX = centerX + Math.cos(endAngle) * radius;
          const endY = centerY + Math.sin(endAngle) * radius;
          const endColor = getGradientColor(actualProgress);
          progressCircleRef.current.lineStyle(0);
          progressCircleRef.current.beginFill(endColor, 1);
          progressCircleRef.current.drawCircle(endX, endY, strokeWidth / 2);
          progressCircleRef.current.endFill();
        } else {
          // When complete, draw cap at the starting position (full circle)
          const fullEndAngle = startAngle + Math.PI * 2;
          const endX = centerX + Math.cos(fullEndAngle) * radius;
          const endY = centerY + Math.sin(fullEndAngle) * radius;
          const endColor = getGradientColor(1);
          progressCircleRef.current.lineStyle(0);
          progressCircleRef.current.beginFill(endColor, 1);
          progressCircleRef.current.drawCircle(endX, endY, strokeWidth / 2);
          progressCircleRef.current.endFill();
        }
      }

      // Continue animation until complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - ensure full circle is drawn
        animationRef.current = null;
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [app, isVisible, size, strokeWidth]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-20"
      style={{
        width: size,
        height: size,
        top: '50%',
        left: '50%',
        marginTop: `-${size / 2}px`,
        marginLeft: `-${size / 2}px`,
        pointerEvents: 'none',
      }}
    />
  );
};

