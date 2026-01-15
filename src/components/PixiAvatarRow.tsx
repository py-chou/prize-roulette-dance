import { useEffect, useRef, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Participant, DrawPhase, SpinPhase } from '@/types/participant';
import { usePixiApp } from '@/hooks/usePixiApp';
import { getEnoughParticipants } from '@/utils/participantUtils';
import { generateAvatarColor, generateAvatarLetter } from '@/utils/avatarUtils';

interface PixiAvatarRowProps {
  participants: Participant[];
  direction: 'left' | 'right';
  spinPhase: SpinPhase;
  phase: DrawPhase;
  rowIndex: number;
  totalRows: number;
  width?: number;
  height?: number;
}

const MIN_AVATARS_PER_ROW = 20;
const AVATAR_SIZE = 80;
const AVATAR_GAP = 16;

// Convert hex color to number for PixiJS
const hexToNumber = (hex: string): number => {
  return parseInt(hex.replace('#', ''), 16);
};

export const PixiAvatarRow = ({
  participants,
  direction,
  spinPhase,
  phase,
  rowIndex,
  totalRows,
  width,
  height = 100,
}: PixiAvatarRowProps) => {
  const containerRef = useRef<PIXI.Container | null>(null);
  const avatarsRef = useRef<PIXI.Container[]>([]);
  const animationRef = useRef<number | null>(null);
  const currentXRef = useRef(0);
  const speedRef = useRef(0);
  const targetSpeedRef = useRef(0);
  const phaseRef = useRef<DrawPhase>(phase);
  const spinPhaseRef = useRef<SpinPhase>(spinPhase);

  // Ensure we have enough participants using shared utility
  const enoughParticipants = useMemo(() => {
    return getEnoughParticipants(participants, MIN_AVATARS_PER_ROW);
  }, [participants]);

  const containerDivRef = useRef<HTMLDivElement>(null);
  // Pre-initialize PixiJS app even when idle to avoid lag when starting
  const { containerRef: pixiContainerRef, app } = usePixiApp({
    width: width || (typeof window !== 'undefined' ? window.innerWidth : 800),
    height,
    backgroundColor: 'transparent',
    antialias: true,
  });
  
  // Pre-create canvas textures for letters to avoid lag during creation
  const textureCacheRef = useRef<Map<string, PIXI.Texture>>(new Map());

  // Update phase refs to ensure animation loop has access to latest values
  useEffect(() => {
    phaseRef.current = phase;
    spinPhaseRef.current = spinPhase;
  }, [phase, spinPhase]);

  // Create container and avatars - recreate when participants change
  useEffect(() => {
    if (!app || enoughParticipants.length === 0) return;
    
    // Clean up existing container if it exists (when participants change)
    if (containerRef.current && app && app.stage) {
      try {
        // Stop animation first
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        
        // Remove from stage
        const index = app.stage.children.indexOf(containerRef.current);
        if (index !== -1) {
          app.stage.removeChildAt(index);
        }
        
        // Destroy container
        try {
          if (!containerRef.current.destroyed) {
            containerRef.current.removeChildren();
            containerRef.current.destroy();
          }
        } catch (e) {
          // Ignore destroy errors
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      containerRef.current = null;
      avatarsRef.current = [];
    }

    // Create main container immediately
    const container = new PIXI.Container();
    container.x = 0;
    container.y = height / 2;
    app.stage.addChild(container);
    containerRef.current = container;

    // Create avatars - optimized for performance
    const avatars: PIXI.Container[] = [];
    const rowWidth = enoughParticipants.length * (AVATAR_SIZE + AVATAR_GAP);
    
    // Set initial position immediately so animation can start
    currentXRef.current = direction === 'right' ? -rowWidth / 3 : 0;
    container.x = currentXRef.current;

    enoughParticipants.forEach((participant, index) => {
      const avatarContainer = new PIXI.Container();
      avatarContainer.x = index * (AVATAR_SIZE + AVATAR_GAP) + AVATAR_SIZE / 2;

      // Generate color and letter for this participant
      const bgColor = hexToNumber(generateAvatarColor(participant.id));
      const letter = generateAvatarLetter(participant.id, participant.name);

      // Create circular background
      const background = new PIXI.Graphics();
      background.beginFill(bgColor);
      background.drawCircle(0, 0, AVATAR_SIZE / 2);
      background.endFill();
      avatarContainer.addChild(background);

      // Create text for the letter - use cached texture for better performance
      const fontSize = AVATAR_SIZE * 0.5;
      let textTexture = textureCacheRef.current.get(letter);
      
      if (!textTexture && app) {
        // Create canvas and texture only once per letter
        const textCanvas = document.createElement('canvas');
        textCanvas.width = AVATAR_SIZE;
        textCanvas.height = AVATAR_SIZE;
        const ctx = textCanvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, AVATAR_SIZE / 2, AVATAR_SIZE / 2);
          
          // Create texture from canvas and cache it
          textTexture = PIXI.Texture.from(textCanvas);
          textureCacheRef.current.set(letter, textTexture);
        }
      }
      
      if (textTexture) {
        const textSprite = new PIXI.Sprite(textTexture);
        textSprite.anchor.set(0.5);
        textSprite.x = 0;
        textSprite.y = 0;
        avatarContainer.addChild(textSprite);
      } else {
        // Fallback: use Graphics to draw a simple circle if canvas is not available
        const textGraphics = new PIXI.Graphics();
        textGraphics.beginFill(0xffffff);
        textGraphics.drawCircle(0, 0, fontSize * 0.3);
        textGraphics.endFill();
        avatarContainer.addChild(textGraphics);
      }

      // Create border
      const border = new PIXI.Graphics();
      const borderColor = spinPhase !== 'idle' && phase !== 'complete' ? 0xffd700 : 0x666666;
      border.lineStyle(2, borderColor, 0.5);
      border.drawCircle(0, 0, AVATAR_SIZE / 2);
      avatarContainer.addChild(border);

      container.addChild(avatarContainer);
      avatars.push(avatarContainer);
    });

    avatarsRef.current = avatars;

    // Only cleanup when component unmounts or participants change significantly
    // Don't cleanup when phase changes - container should persist
    return () => {
      // Only cleanup if this is a real unmount (participants changed significantly)
      // We'll handle cleanup in a separate effect for component unmount
    };
  }, [app, enoughParticipants, direction, height]);
  
  // Separate effect to handle container recreation when participants change
  useEffect(() => {
    if (!app || enoughParticipants.length === 0 || !containerRef.current) return;
    
    // If container exists but participants changed, we need to update avatars
    // For now, we'll keep the existing container and just update animation state
    // Only recreate if really necessary (e.g., participant count changed significantly)
  }, [app, enoughParticipants]);
  
  // Cleanup effect - only runs on component unmount
  useEffect(() => {
    return () => {
      // This cleanup only runs when component is unmounted
      const containerToCleanup = containerRef.current;
      const avatarsToCleanup = [...avatarsRef.current];
      
      // Stop animation immediately
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear refs to prevent any further access
      containerRef.current = null;
      avatarsRef.current = [];

      // Then clean up the actual objects
      if (containerToCleanup && app && app.stage) {
        try {
          // Remove filters from all avatars before destroying
          avatarsToCleanup.forEach(avatar => {
            try {
              if (avatar && !avatar.destroyed && avatar.filters) {
                avatar.filters = [];
              }
            } catch (error) {
              // Ignore filter cleanup errors
            }
          });

          // Remove container from stage first (this stops rendering)
          if (app.stage.children.includes(containerToCleanup)) {
            app.stage.removeChild(containerToCleanup);
          }
          
          // Wait a frame before destroying to ensure rendering has stopped
          requestAnimationFrame(() => {
            try {
              if (containerToCleanup && !containerToCleanup.destroyed) {
                containerToCleanup.removeChildren();
                containerToCleanup.destroy();
              }
            } catch (destroyError) {
              // Ignore destroy errors
            }
          });
        } catch (error) {
          // If cleanup fails, try to at least remove from stage
          try {
            if (containerToCleanup && app.stage && app.stage.children.includes(containerToCleanup)) {
              app.stage.removeChild(containerToCleanup);
            }
          } catch (e) {
            // Ignore secondary cleanup errors
          }
        }
      }
    };
  }, [app]);

  // Animation loop
  useEffect(() => {
    // Stop animation if phase is complete or conditions not met
    const currentPhase: DrawPhase = phase;
    const isComplete = currentPhase === 'complete' || currentPhase === 'revealing';
    const shouldStop = !app || !containerRef.current || enoughParticipants.length === 0 || isComplete;
    
    if (shouldStop) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Reset speed when stopping
      speedRef.current = 0;
      targetSpeedRef.current = 0;
      return;
    }
    
    // Wait for container to be created if it doesn't exist yet
    // This can happen when phase changes from 'complete' to 'idle'
    if (!containerRef.current) {
      // Use a small delay to wait for container creation
      const checkContainer = () => {
        const currentPhaseCheck: DrawPhase = phase;
        const isCompleteCheck = currentPhaseCheck === 'complete' || currentPhaseCheck === 'revealing';
        if (containerRef.current && !isCompleteCheck && app) {
          startAnimation();
        } else if (!isCompleteCheck && app) {
          // Retry after a short delay (max 10 retries = 500ms)
          let retryCount = 0;
          const maxRetries = 10;
          const retry = () => {
            retryCount++;
            if (containerRef.current && !isCompleteCheck) {
              startAnimation();
            } else if (retryCount < maxRetries && !isCompleteCheck) {
              setTimeout(retry, 50);
            }
          };
          setTimeout(retry, 50);
        }
      };
      setTimeout(checkContainer, 50);
      return;
    }
    
    startAnimation();
    
    function startAnimation() {
      const currentPhaseCheck: DrawPhase = phase;
      const isCompleteCheck = currentPhaseCheck === 'complete' || currentPhaseCheck === 'revealing';
      if (!containerRef.current || isCompleteCheck) return;
      
      const rowWidth = enoughParticipants.length * (AVATAR_SIZE + AVATAR_GAP);
      const segmentWidth = rowWidth / 3;

      // Determine target speed based on spin phase
      let baseSpeed = 0;
      if (spinPhase === 'idle') {
        baseSpeed = direction === 'left' ? -0.5 : 0.5; // Slow idle speed
        // Always set speed when in idle phase to ensure animation starts
        speedRef.current = baseSpeed;
      } else if (spinPhase === 'peak') {
        baseSpeed = direction === 'left' ? -15 : 15; // Fast spinning speed
      } else {
        baseSpeed = 0;
      }
      
      // Increase speed by 100% (2x) during spinning phase
      if (currentPhaseCheck === 'spinning') {
        targetSpeedRef.current = baseSpeed * 2; // 2x = 100% increase
      } else {
        targetSpeedRef.current = baseSpeed;
      }

      const animate = () => {
        // Use refs to get current values to avoid closure issues
        if (!containerRef.current) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          return;
        }

        // Check current phase using ref to get latest value
        const currentPhaseValue = phaseRef.current;
        const isComplete = currentPhaseValue === 'complete' || currentPhaseValue === 'revealing';
        if (isComplete) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          return;
        }

        // Smoothly interpolate speed
        speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.1;

        // Update position
        currentXRef.current += speedRef.current;

        // Handle infinite loop
        if (direction === 'left') {
          if (currentXRef.current <= -segmentWidth) {
            currentXRef.current += segmentWidth;
          }
        } else {
          if (currentXRef.current >= 0) {
            currentXRef.current -= segmentWidth;
          }
        }

        // Check if container is still valid before updating
        if (containerRef.current && 
            containerRef.current.parent && 
            !containerRef.current.destroyed &&
            app.stage.children.includes(containerRef.current)) {
          try {
            containerRef.current.x = currentXRef.current;
          } catch (e) {
            // Container may have been destroyed, stop animation
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
              animationRef.current = null;
            }
            return;
          }
        } else {
          // Container is invalid, stop animation
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          return;
        }

        // Apply blur filter during spinning - use refs to get latest values
        // Check if avatars still exist before accessing them
        if (avatarsRef.current && avatarsRef.current.length > 0) {
          const currentSpinPhaseValue = spinPhaseRef.current;
          // Only apply blur when spinning and not in complete/revealing phase
          const currentPhaseForBlur: DrawPhase = phaseRef.current;
          const isSpinning = currentSpinPhaseValue !== 'idle' && 
                            currentPhaseForBlur !== 'complete' && 
                            currentPhaseForBlur !== 'revealing';
          if (isSpinning) {
            avatarsRef.current.forEach(avatar => {
              try {
                if (avatar && avatar.parent && !avatar.destroyed) {
                  if (!avatar.filters || avatar.filters.length === 0) {
                    avatar.filters = [new PIXI.BlurFilter(4)];
                  }
                }
              } catch (e) {
                // Ignore errors for destroyed avatars
              }
            });
          } else {
            avatarsRef.current.forEach(avatar => {
              try {
                if (avatar && avatar.parent && !avatar.destroyed) {
                  avatar.filters = [];
                }
              } catch (e) {
                // Ignore errors for destroyed avatars
              }
            });
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [app, spinPhase, phase, direction, enoughParticipants]);




  // Handle resize when container is ready
  useEffect(() => {
    if (!app || !containerDivRef.current) return;

    const handleResize = () => {
      if (app && containerDivRef.current) {
        const rect = containerDivRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          app.renderer.resize(rect.width, rect.height);
        }
      }
    };

    // Use ResizeObserver for better performance
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerDivRef.current);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Initial resize
    setTimeout(handleResize, 0);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [app]);

  return (
    <div 
      ref={containerDivRef}
      className={`overflow-hidden py-2 relative`} 
      style={{ height, width: '100%' }}
    >
      <div ref={pixiContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

