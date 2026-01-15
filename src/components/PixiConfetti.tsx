import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { usePixiApp } from '@/hooks/usePixiApp';

interface PixiConfettiProps {
  isActive: boolean;
  particleCount?: number;
  width?: number;
  height?: number;
}

interface Particle {
  sprite: PIXI.Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: number;
  size: number;
}

interface ParticleState {
  delay: number;
  duration: number;
  repeatDelay: number;
  startTime: number;
  cycleStartTime: number;
  isInRepeatDelay: boolean;
}

export const PixiConfetti = ({
  isActive,
  particleCount = 15, // Reduced from 20 for better performance
  width,
  height,
}: PixiConfettiProps) => {
  const particlesRef = useRef<Particle[]>([]);
  const particleStatesRef = useRef<ParticleState[]>([]);
  const animationRef = useRef<number | null>(null);
  const particleContainerRef = useRef<PIXI.Container | null>(null);
  const textureCacheRef = useRef<Map<number, PIXI.Texture>>(new Map());

  const { containerRef: pixiContainerRef, app } = usePixiApp({
    width: width || window.innerWidth,
    height: height || window.innerHeight,
    backgroundColor: 'transparent',
    antialias: false, // Disable antialias for better performance
  });

  // Create particles with texture caching and ParticleContainer
  useEffect(() => {
    if (!app || !isActive) return;

    // Colors matching the original DOM confetti: Gold, Purple, Cyan, Red
    const colors = [
      0xffd700, // hsl(45 100% 50%) - Gold
      0xcc66ff, // hsl(280 80% 60%) - Purple
      0x00ccff, // hsl(190 100% 50%) - Cyan
      0xff6666, // hsl(0 84% 60%) - Red
    ];

    // Create Container for particles (using Sprite with texture cache is already efficient)
    const particleContainer = new PIXI.Container();
    app.stage.addChild(particleContainer);
    particleContainerRef.current = particleContainer;

    const particles: Particle[] = [];
    const particleStates: ParticleState[] = [];

    // Create textures for each color (cached)
    const createTexture = (color: number): PIXI.Texture => {
      if (textureCacheRef.current.has(color)) {
        return textureCacheRef.current.get(color)!;
      }

      const graphics = new PIXI.Graphics();
      graphics.beginFill(color);
      graphics.drawCircle(0, 0, 6);
      graphics.endFill();
      
      const texture = app.renderer.generateTexture(graphics);
      graphics.destroy();
      
      textureCacheRef.current.set(color, texture);
      return texture;
    };

    for (let i = 0; i < particleCount; i++) {
      const color = colors[i % colors.length];
      const texture = createTexture(color);
      const sprite = new PIXI.Sprite(texture);
      
      // Initial position: random x, start from top (-20)
      const initialX = Math.random() * app.screen.width;
      const initialY = -20;
      
      // Velocity: slight horizontal drift, downward fall
      const vx = (Math.random() - 0.5) * 2;
      const vy = 2 + Math.random() * 3;
      
      // Rotation: random initial rotation and rotation speed
      const rotation = Math.random() * Math.PI * 2;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;

      sprite.anchor.set(0.5);
      sprite.x = initialX;
      sprite.y = initialY;
      sprite.rotation = rotation;
      sprite.alpha = 0; // Start invisible for fade-in effect

      particleContainer.addChild(sprite);

      const particle: Particle = {
        sprite,
        x: initialX,
        y: initialY,
        vx,
        vy,
        rotation,
        rotationSpeed,
        color,
        size: 6,
      };

      particles.push(particle);

      // Initialize particle state
      particleStates.push({
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        repeatDelay: Math.random() * 2,
        startTime: performance.now(),
        cycleStartTime: performance.now(),
        isInRepeatDelay: false,
      });
    }

    particlesRef.current = particles;
    particleStatesRef.current = particleStates;

    return () => {
      if (particleContainerRef.current && app.stage) {
        app.stage.removeChild(particleContainerRef.current);
        particleContainerRef.current.destroy({ children: true });
        particleContainerRef.current = null;
      }
      particlesRef.current = [];
      particleStatesRef.current = [];
    };
  }, [app, isActive, particleCount]);

  // Animate particles with optimized performance
  useEffect(() => {
    if (!app || !isActive || particlesRef.current.length === 0) return;

    const particleStates = particleStatesRef.current;
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      // Use delta time for smoother animation
      const deltaTime = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;
      
      // Clamp delta time to prevent large jumps
      const clampedDelta = Math.min(deltaTime, 0.1);
      
      const screenHeight = app.screen.height;
      const screenWidth = app.screen.width;
      
      // Batch update all particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const state = particleStates[i];
        const elapsed = (currentTime - state.startTime) / 1000;
        
        // Handle initial delay
        if (elapsed < state.delay) {
          particle.sprite.alpha = 0;
          particle.sprite.y = -20;
          continue;
        }
        
        const cycleElapsed = (currentTime - state.cycleStartTime) / 1000;
        const totalCycleTime = state.duration + state.repeatDelay;
        
        // Check if we're in repeat delay phase
        if (cycleElapsed > state.duration) {
          if (!state.isInRepeatDelay) {
            state.isInRepeatDelay = true;
            particle.sprite.alpha = 0;
            // Reset position for next cycle
            particle.x = Math.random() * screenWidth;
            particle.y = -20;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = 2 + Math.random() * 3;
          }
          
          // Check if repeat delay is over
          if (cycleElapsed >= totalCycleTime) {
            state.cycleStartTime = currentTime;
            state.isInRepeatDelay = false;
            state.delay = 0;
            state.duration = 3 + Math.random() * 2;
            state.repeatDelay = Math.random() * 2;
          }
          continue;
        }
        
        // Normal animation phase
        state.isInRepeatDelay = false;
        const progress = cycleElapsed / state.duration;
        
        // Update position using delta time for smoother animation
        particle.y += particle.vy * clampedDelta * 60; // Scale to match 60fps
        particle.x += particle.vx * clampedDelta * 60;
        particle.rotation += particle.rotationSpeed * clampedDelta * 60;

        // Wrap around horizontally if needed
        if (particle.x < -10) {
          particle.x = screenWidth + 10;
        } else if (particle.x > screenWidth + 10) {
          particle.x = -10;
        }

        // Batch update sprite properties
        particle.sprite.x = particle.x;
        particle.sprite.y = particle.y;
        particle.sprite.rotation = particle.rotation;

        // Fade in/out effect
        if (progress < 0.1) {
          particle.sprite.alpha = progress * 10;
        } else if (progress > 0.9) {
          particle.sprite.alpha = (1 - progress) * 10;
        } else {
          particle.sprite.alpha = 1;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [app, isActive]);

  if (!isActive) return null;

  return (
    <div
      ref={pixiContainerRef}
      className="fixed inset-0 pointer-events-none z-[0]"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

