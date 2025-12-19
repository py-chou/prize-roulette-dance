import { Participant } from '@/types/participant';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SpinPhase = 'idle' | 'accelerating' | 'peak' | 'decelerating' | 'stopped';

interface AvatarRowProps {
  participants: Participant[];
  direction: 'left' | 'right';
  spinPhase: SpinPhase;
  rowIndex: number;
  totalRows: number;
}

export const AvatarRow = ({ participants, direction, spinPhase, rowIndex, totalRows }: AvatarRowProps) => {
  // Duplicate participants for seamless loop
  const duplicatedParticipants = [...participants, ...participants, ...participants];
  
  // Offset for staggered layout
  const offset = rowIndex % 2 === 1 ? 'ml-10' : '';
  
  // Slow for idle (carousel), fast for spinning phases
  const getAnimationDuration = () => {
    switch (spinPhase) {
      case 'idle': return 30; // Slow carousel
      case 'accelerating': return 1.5; // Fast
      case 'peak': return 1.5; // Fast
      case 'decelerating': return 1.5; // Fast
      case 'stopped': return 0;
      default: return 30;
    }
  };

  // Staggered stop - rows stop one by one
  const stopDelay = rowIndex * 0.15;
  const isRowStopped = spinPhase === 'stopped';
  const isSpinning = spinPhase !== 'idle' && spinPhase !== 'stopped';
  
  const duration = getAnimationDuration();

  return (
    <div className={cn("overflow-hidden py-2 relative", offset)}>
      <motion.div
        className="flex gap-4"
        style={{ width: 'max-content' }}
        animate={
          isRowStopped
            ? { x: 0 }
            : {
                x: direction === 'left' 
                  ? ['0%', '-33.33%'] 
                  : ['-33.33%', '0%'],
              }
        }
        transition={
          isRowStopped
            ? { 
                type: 'spring', 
                stiffness: 100, 
                damping: 20,
                delay: stopDelay,
              }
            : {
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
              }
        }
      >
        {duplicatedParticipants.map((participant, index) => (
          <motion.div
            key={`${participant.id}-${index}`}
            className="flex-shrink-0"
            whileHover={spinPhase === 'idle' ? { scale: 1.1, zIndex: 10 } : {}}
          >
            <motion.div 
              className="relative group"
              animate={{
                filter: isSpinning ? 'blur(4px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 bg-card shadow-lg transition-all duration-300",
                isSpinning ? "border-gold/50" : "border-secondary"
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