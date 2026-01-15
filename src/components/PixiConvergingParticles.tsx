import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';

interface PixiConvergingParticlesProps {
  particleCount?: number;
  isVisible?: boolean;
}

interface Particle {
  sprite: PIXI.Graphics;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: number;
  glowColor: number;
  delay: number;
  duration: number;
}

export const PixiConvergingParticles = ({
  particleCount = 12,
  isVisible = true,
}: PixiConvergingParticlesProps) => {
  const { containerRef, app } = usePixiApp({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
    backgroundColor: 'transparent',
    // Don't use resizeTo to avoid conflicts with other PixiJS apps
  });

  const particlesRef = useRef<Particle[]>([]);
  const containerRef2 = useRef<PIXI.Container | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

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

  // Create particles
  useEffect(() => {
    if (!app || !isVisible) return;

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;
    const radius = 400; // Starting radius - matches DOM version

    // Create container
    const container = new PIXI.Container();
    app.stage.addChild(container);
    containerRef2.current = container;

    // Create particles - matching DOM version exactly
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      // Match DOM version: angle = (i * 30) * (Math.PI / 180) for 12 particles
      const angle = (i * (360 / particleCount)) * (Math.PI / 180);
      const startX = Math.cos(angle) * radius; // Relative to center
      const startY = Math.sin(angle) * radius; // Relative to center

      // Alternate colors: hsl(45 100% 50%) and hsl(30 100% 55%)
      const isEven = i % 2 === 0;
      const color = isEven 
        ? hslToRgb(45, 100, 50)  // Gold
        : hslToRgb(30, 100, 55); // Orange
      const glowColor = isEven
        ? hslToRgb(45, 100, 50)
        : hslToRgb(30, 100, 50);

      // Create particle sprite - matching DOM size (w-2 h-2 = 8px, so radius 4px)
      const particle = new PIXI.Graphics();
      
      // Draw particle with glow effect matching DOM boxShadow
      // Outer glow (boxShadow effect)
      particle.beginFill(glowColor, 0.8);
      particle.drawCircle(0, 0, 6);
      particle.endFill();
      
      // Main particle
      particle.beginFill(color, 1);
      particle.drawCircle(0, 0, 4); // 2px radius = 4px diameter (w-2 h-2)
      particle.endFill();

      // Position relative to container center (will be set in animation)
      particle.x = centerX + startX;
      particle.y = centerY + startY;
      particle.alpha = 0; // Start invisible
      particle.scale.set(0.5); // Start at scale 0.5
      container.addChild(particle);

      particles.push({
        sprite: particle,
        startX: centerX + startX,
        startY: centerY + startY,
        targetX: centerX,
        targetY: centerY,
        color,
        glowColor,
        delay: i * 0.1, // Match DOM: delay: i * 0.1
        duration: 1.2,  // Match DOM: duration: 1.2
      });
    }

    particlesRef.current = particles;

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
      particlesRef.current = [];
    };
  }, [app, isVisible, particleCount]);

  // Animate particles
  useEffect(() => {
    if (!app || !isVisible || !containerRef2.current || particlesRef.current.length === 0) {
      // Stop animation when not visible or when resources are not available
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear particles when not visible
      if (!isVisible && particlesRef.current.length > 0) {
        particlesRef.current.forEach((particle) => {
          if (particle.sprite && !particle.sprite.destroyed) {
            particle.sprite.alpha = 0;
          }
        });
      }
      return;
    }

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    // Reset animation
    startTimeRef.current = Date.now();

    const animate = () => {
      if (!startTimeRef.current || particlesRef.current.length === 0) return;

      const currentTime = Date.now();
      const elapsed = (currentTime - startTimeRef.current) / 1000; // Convert to seconds

      particlesRef.current.forEach((particle) => {
        // Calculate animation progress (0 to 1)
        // Match DOM version: duration 1.2s, repeat infinite, ease: 'easeIn'
        // 
        // Current logic analysis:
        // - All particles have same duration (1.2s) and same easing (easeIn)
        // - All particles move same distance (400px radius to center)
        // - Each particle has different delay (i * 0.1s)
        // 
        // This means:
        // - All particles have SAME movement speed (same distance, same time, same easing)
        // - Each particle reaches center at DIFFERENT absolute times (due to different delays)
        // - Each particle disappears at DIFFERENT absolute times (but same relative time in their cycle)
        //
        // Example:
        // - Particle 0: starts at t=0, reaches center at t=1.2, disappears at t=1.2
        // - Particle 1: starts at t=0.1, reaches center at t=1.3, disappears at t=1.3
        // - Particle 2: starts at t=0.2, reaches center at t=1.4, disappears at t=1.4
        
        // Fix: Each particle should have its own independent cycle
        // The total cycle time for each particle is: delay + duration
        // But we need to handle the case where delay might be large
        // Better approach: track each particle's cycle independently
        const totalCycleTime = particle.delay + particle.duration; // e.g., 0.1 + 1.2 = 1.3s for particle 1
        const cycleTime = elapsed % totalCycleTime;
        const adjustedTime = cycleTime - particle.delay;

        if (adjustedTime < 0) {
          // Before delay: invisible and at start position (matches DOM initial state)
          particle.sprite.alpha = 0;
          particle.sprite.scale.set(0.5);
          particle.sprite.x = particle.startX;
          particle.sprite.y = particle.startY;
        } else if (adjustedTime >= 0 && adjustedTime < particle.duration) {
          // During animation - progress is relative to this particle's animation start
          const progress = Math.min(adjustedTime / particle.duration, 1);
          
          // EaseIn: t^3 (cubic ease in) - matches DOM ease: 'easeIn'
          // This applies to position movement
          const easedProgress = progress * progress * progress;
          
          // Position: move from start to center (target) - matches DOM x: [startX, 0], y: [startY, 0]
          // Position uses easedProgress and moves throughout the entire duration
          // All particles move at the same speed (same distance, same time, same easing)
          particle.sprite.x = particle.startX + (particle.targetX - particle.startX) * easedProgress;
          particle.sprite.y = particle.startY + (particle.targetY - particle.startY) * easedProgress;
          
          // Opacity: [0, 1, 0] - framer-motion splits 3 keyframes evenly:
          // 0% → 50%: 0 to 1 (fade in)
          // 50% → 100%: 1 to 0 (fade out)
          // Each particle fades out at the same relative time (50% of their animation)
          // but at different absolute times (due to different delays)
          if (progress < 0.5) {
            // First half: fade in from 0 to 1
            const fadeProgress = progress / 0.5;
            particle.sprite.alpha = fadeProgress;
          } else {
            // Second half: fade out from 1 to 0
            const fadeProgress = (progress - 0.5) / 0.5;
            particle.sprite.alpha = 1 - fadeProgress;
          }
          
          // Scale: [0.5, 1.5, 0] - framer-motion splits 3 keyframes evenly:
          // 0% → 50%: 0.5 to 1.5 (grow)
          // 50% → 100%: 1.5 to 0 (shrink to disappear)
          // Each particle disappears at the same relative time (100% of their animation)
          // but at different absolute times (due to different delays)
          if (progress < 0.5) {
            // First half: scale from 0.5 to 1.5
            const scaleProgress = progress / 0.5;
            particle.sprite.scale.set(0.5 + scaleProgress * 1.0);
          } else {
            // Second half: scale from 1.5 to 0
            const scaleProgress = (progress - 0.5) / 0.5;
            particle.sprite.scale.set(1.5 - scaleProgress * 1.5);
          }
        } else {
          // After animation: invisible and reset to start (ready for next cycle)
          particle.sprite.alpha = 0;
          particle.sprite.scale.set(0.5);
          particle.sprite.x = particle.startX;
          particle.sprite.y = particle.startY;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [app, isVisible, particleCount]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

