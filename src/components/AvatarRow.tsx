import { Participant } from '@/types/participant';
import { DrawPhase } from '@/types/participant';
import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export type SpinPhase = 'idle' | 'accelerating' | 'peak' | 'decelerating';

interface AvatarRowProps {
  participants: Participant[];
  direction: 'left' | 'right';
  spinPhase: SpinPhase;
  phase: DrawPhase;
  rowIndex: number;
  totalRows: number;
}

export const AvatarRow = ({ participants, direction, spinPhase, phase, rowIndex, totalRows }: AvatarRowProps) => {
  // Ensure we have enough participants by randomly duplicating if needed
  // Minimum 20 avatars per row for smooth infinite loop
  const MIN_AVATARS_PER_ROW = 20;
  const getEnoughParticipants = useMemo(() => {
    if (participants.length === 0) return [];
    
    let result = [...participants];
    let idCounter = Math.max(...participants.map(p => p.id), 0);
    
    // If not enough, randomly duplicate until we have enough
    while (result.length < MIN_AVATARS_PER_ROW) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      idCounter++;
      result.push({ 
        ...participants[randomIndex], 
        id: idCounter
      });
    }
    
    // Duplicate multiple times for seamless infinite loop
    return [...result, ...result, ...result];
  }, [participants]);
  
  // Offset for staggered layout
  const offset = rowIndex % 2 === 1 ? 'ml-10' : '';
  
  const controls = useAnimationControls();
  const [hasCompletedAcceleration, setHasCompletedAcceleration] = useState(false);

  // Reset acceleration flag when spinPhase changes
  useEffect(() => {
    if (spinPhase === 'idle') {
      setHasCompletedAcceleration(false);
    }
  }, [spinPhase]);

  // Update animation smoothly when spinPhase changes
  useEffect(() => {
    if (spinPhase === 'idle') {
      // Slow carousel for idle state with ease-in effect
      controls.start({
        x: direction === 'left' 
          ? ['0%', '-33.33%'] 
          : ['-33.33%', '0%'],
        transition: {
          duration: 45,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1], // cubic-bezier for smooth ease-in effect (slow start, gradually faster)
        },
      });
    } else if (spinPhase === 'peak') {
      // Always start with acceleration if not already completed
      if (!hasCompletedAcceleration) {
        // Dynamic acceleration: 4 stages with progressive speed increase
        // Time distribution: 0.5s / 0.5s / 0.5s / 0.5s (total 2s)
        controls.start({
          x: direction === 'left' 
            ? ['0%', '-8.33%', '-16.66%', '-25%', '-33.33%'] 
            : ['-33.33%', '-25%', '-16.66%', '-8.33%', '0%'],
          transition: {
            duration: 2, // Total 2 seconds
            times: [0, 0.25, 0.5, 0.75, 1], // All stages: 0.5s each (0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1)
            ease: [
              [0.4, 0, 0.2, 1], // Stage 1: Slow start (0.5 seconds)
              [0.2, 0, 0.4, 1], // Stage 2: Medium acceleration (0.5 seconds)
              [0.1, 0, 0.3, 1], // Stage 3: Fast acceleration (0.5 seconds)
              [0, 0, 0.2, 1],   // Stage 4: Very fast (0.5 seconds)
            ],
            onComplete: () => {
              setHasCompletedAcceleration(true);
              // After acceleration, switch to infinite constant speed scroll
              controls.start({
                x: direction === 'left' 
                  ? ['0%', '-33.33%'] 
                  : ['-33.33%', '0%'],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                },
              });
            },
          },
        });
      } else {
        // Already completed acceleration, continue with infinite scroll
        controls.start({
          x: direction === 'left' 
            ? ['0%', '-33.33%'] 
            : ['-33.33%', '0%'],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          },
        });
      }
    }
  }, [controls, direction, spinPhase, hasCompletedAcceleration]);

  return (
    <div className={cn("overflow-hidden py-2 relative", offset)}>
      <motion.div
        className="flex gap-4"
        style={{ width: 'max-content' }}
        animate={controls}
      >
        {getEnoughParticipants.map((participant, index) => (
          <motion.div
            key={`${participant.id}-${index}`}
            className="flex-shrink-0"
            whileHover={spinPhase === 'idle' ? { scale: 1.1, zIndex: 10 } : {}}
          >
            <motion.div 
              className="relative group"
              animate={{
                filter: spinPhase !== 'idle' && phase !== 'complete' ? 'blur(4px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 bg-card shadow-lg transition-all duration-300",
                spinPhase !== 'idle' && phase !== 'complete' ? "border-gold/50" : "border-secondary"
              )}>
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {spinPhase === 'idle' && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  <span className="text-xs bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-foreground border border-border">
                    {participant.name}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};